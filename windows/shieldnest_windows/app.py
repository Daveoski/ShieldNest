"""ShieldNest for Windows: on/off window around the local DNS filter."""

import atexit
import ctypes
import sys
import threading
import tkinter as tk
from collections import deque
from pathlib import Path
from tkinter import messagebox

from shieldnest_windows import __version__, system_dns
from shieldnest_windows.blocklist import Blocklist
from shieldnest_windows.proxy import DnsProxy

# Matches the website palette (frontend/src/app/globals.css)
BG = "#0E1621"
SURFACE = "#151F2C"
SURFACE_2 = "#1C2837"
TEXT = "#F2F5F8"
MUTED = "#AAB6C4"
PRIMARY = "#3DDBB8"
ON_PRIMARY = "#06302A"
ERROR = "#F2766B"
FONT = "Segoe UI"


class Protection:
    """Owns the blocklist, proxy and system DNS change; safe to call from a worker thread."""

    def __init__(self):
        self.blocklist = Blocklist()
        self.proxy = DnsProxy(is_blocked=lambda name: self.blocklist.match(name) is not None,
                              on_blocked=self._record)
        self.running = False
        self.blocked_count = 0
        self.recent: deque[str] = deque(maxlen=50)
        self._lock = threading.Lock()

    def _record(self, name: str) -> None:
        with self._lock:
            self.blocked_count += 1
            self.recent.appendleft(name)

    def snapshot(self) -> tuple[int, list[str]]:
        with self._lock:
            return self.blocked_count, list(self.recent)

    def turn_on(self) -> None:
        self.blocklist.load()
        self.proxy.start()
        try:
            system_dns.enable()
        except Exception:
            self.proxy.stop()
            system_dns.disable()
            raise
        self.running = True

    def turn_off(self) -> None:
        system_dns.disable()
        self.proxy.stop()
        self.running = False


class App:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.protection = Protection()
        self.busy = False

        root.title("ShieldNest")
        root.geometry("420x640")
        root.minsize(380, 560)
        root.configure(bg=BG)
        icon = _resource("shieldnest.ico")
        if icon.exists():
            root.iconbitmap(default=str(icon))
        root.protocol("WM_DELETE_WINDOW", self.on_close)

        tk.Label(root, text="ShieldNest", bg=BG, fg=TEXT, font=(FONT, 16, "bold")).pack(pady=(20, 10))

        self.canvas = tk.Canvas(root, width=190, height=190, bg=BG, highlightthickness=0, cursor="hand2")
        self.canvas.pack(pady=10)
        self.canvas.bind("<Button-1>", lambda e: self.toggle())

        self.title = tk.Label(root, bg=BG, fg=TEXT, font=(FONT, 15, "bold"))
        self.title.pack(pady=(14, 0))
        self.subtitle = tk.Label(root, bg=BG, fg=MUTED, font=(FONT, 10))
        self.subtitle.pack()
        self.message = tk.Label(root, bg=BG, fg=ERROR, font=(FONT, 9), wraplength=360, justify="center")
        self.message.pack(pady=(8, 0))

        stats = tk.Frame(root, bg=BG)
        stats.pack(fill="x", padx=20, pady=16)
        self.blocked_value = self._stat_card(stats, "Blocked")
        self.list_value = self._stat_card(stats, "Domains on list")

        tk.Label(root, text="Recently blocked", bg=BG, fg=MUTED, font=(FONT, 10, "bold"), anchor="w").pack(
            fill="x", padx=20
        )
        self.recent = tk.Listbox(
            root, bg=SURFACE, fg=TEXT, borderwidth=0, highlightthickness=0, font=(FONT, 10),
            selectbackground=SURFACE_2, activestyle="none",
        )
        self.recent.pack(fill="both", expand=True, padx=20, pady=(6, 8))

        tk.Label(root, text=f"Version {__version__} · Closing the window turns protection off",
                 bg=BG, fg=MUTED, font=(FONT, 8)).pack(pady=(0, 10))

        self.render()
        self.poll()

    def _stat_card(self, parent: tk.Frame, label: str) -> tk.Label:
        card = tk.Frame(parent, bg=SURFACE, padx=14, pady=10)
        card.pack(side="left", expand=True, fill="x", padx=4)
        tk.Label(card, text=label, bg=SURFACE, fg=MUTED, font=(FONT, 9), anchor="w").pack(fill="x")
        value = tk.Label(card, text="0", bg=SURFACE, fg=PRIMARY, font=(FONT, 18, "bold"), anchor="w")
        value.pack(fill="x")
        return value

    def draw_shield(self) -> None:
        c = self.canvas
        c.delete("all")
        on = self.protection.running
        c.create_oval(5, 5, 185, 185, fill=PRIMARY if on else SURFACE_2, outline="")
        color = ON_PRIMARY if on else MUTED
        # Shield outline + check mark, scaled from a 24-unit icon
        s, ox, oy = 4.2, 95 - 12 * 4.2, 95 - 12 * 4.2
        shield = [(12, 2.5), (20, 5), (20, 13), (12, 21.5), (4, 13), (4, 5)]
        points = [coord for x, y in shield for coord in (ox + x * s, oy + y * s)]
        c.create_polygon(points, fill="", outline=color, width=7, joinstyle="round")
        c.create_line(ox + 8.5 * s, oy + 12 * s, ox + 11 * s, oy + 14.5 * s, ox + 15.5 * s, oy + 9.5 * s,
                      fill=color, width=7, capstyle="round", joinstyle="round")

    def render(self) -> None:
        self.draw_shield()
        if self.busy:
            self.title.config(text="Please wait…")
            self.subtitle.config(text="")
        elif self.protection.running:
            self.title.config(text="You're protected")
            self.subtitle.config(text="Click the shield to turn off")
        else:
            self.title.config(text="Protection is off")
            self.subtitle.config(text="Click the shield to turn on")
        self.list_value.config(text=f"{len(self.protection.blocklist.domains):,}")

    def poll(self) -> None:
        count, recent = self.protection.snapshot()
        self.blocked_value.config(text=f"{count:,}")
        if list(self.recent.get(0, "end")) != recent:
            self.recent.delete(0, "end")
            for name in recent:
                self.recent.insert("end", name)
        self.root.after(500, self.poll)

    def toggle(self) -> None:
        if self.busy:
            return
        self.busy = True
        self.message.config(text="")
        self.render()
        action = self.protection.turn_off if self.protection.running else self.protection.turn_on
        threading.Thread(target=self._run, args=(action,), daemon=True).start()

    def _run(self, action) -> None:
        error = None
        try:
            action()
        except OSError as e:
            error = (
                "Port 53 is already in use by another program (another DNS tool or VPN)."
                if getattr(e, "winerror", None) == 10048
                else f"Couldn't start protection: {e}"
            )
        except Exception as e:
            error = f"Something went wrong: {e}"
        self.root.after(0, self._finished, error)

    def _finished(self, error: str | None) -> None:
        self.busy = False
        warning = self.protection.blocklist.warning
        self.message.config(text=error or warning or "")
        self.render()

    def on_close(self) -> None:
        if self.protection.running:
            if not messagebox.askokcancel("ShieldNest", "Closing ShieldNest turns protection off. Close anyway?"):
                return
            try:
                self.protection.turn_off()
            except Exception:
                pass  # atexit and the next launch will retry the restore
        self.root.destroy()


def _resource(name: str) -> Path:
    # PyInstaller unpacks bundled files to sys._MEIPASS
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent.parent / "assets"))
    return base / name


def _is_admin() -> bool:
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except OSError:
        return False


def main() -> None:
    # The packaged .exe requests admin rights itself (PyInstaller --uac-admin); this covers running from source
    if not _is_admin():
        messagebox.showerror(
            "ShieldNest",
            "ShieldNest needs administrator rights to change DNS settings.\n\n"
            "Right-click ShieldNest and choose \"Run as administrator\".",
        )
        return

    # Put DNS back if a previous session ended without restoring it
    if system_dns.needs_recovery():
        try:
            system_dns.disable()
        except Exception:
            pass
    atexit.register(lambda: system_dns.needs_recovery() and system_dns.disable())

    ctypes.windll.shcore.SetProcessDpiAwareness(1)
    root = tk.Tk()
    App(root)
    root.mainloop()
