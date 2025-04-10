#!/usr/bin/env python3
from tabulate import tabulate
import os
import sys
import pickle
import inspect

SAVE_LOC = "./saves"

print("Euchre UI Controller")

class UI:
    def hydrate(self, game_token):
        """ Print the contents of a pickled game file """
        full_path = os.path.join(SAVE_LOC, f"{game_token}.hub")
        print(f"hydrating {full_path}")

        with open(full_path, "rb") as fp:                
            game = pickle.load(fp)
            print(type(game))
            print(game)

def invoke(method_name, *args):
    """Dynamically invoke a method."""

    ui = UI()

    if hasattr(ui, method_name):
        method = getattr(ui, method_name)
        method(*args)
    else:
        print(f"Method '{method_name}' not found in UI.")

def print_help():
    """Print available methods for the script."""
    ui = UI()

    print("USAGE")
    print("\ttools/ui.py <method_name> [args...]\n")
    print("METHODS")
    for method in dir(ui):
        attr = getattr(ui, method)
        if callable(attr) == False: continue
        if method.startswith("__"): continue
        if callable(attr) and attr.__doc__ is not None:            
            print(f"\t{method} {get_sig(attr)}: {attr.__doc__.splitlines()[0]}\n")

def get_sig(method):
    sig = inspect.signature(method)
    return ", ".join(
        f"<{name}>" for name, param in sig.parameters.items()
        if param.kind in (param.POSITIONAL_OR_KEYWORD, param.KEYWORD_ONLY)
    )

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "help":
        print_help()
    else:
        invoke(sys.argv[1], *sys.argv[2:])    