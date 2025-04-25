import logging
import sys
import threading

def logger_factory(name, prefix):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    tid_hex = hex(threading.get_ident() % 0x10000)[2:].zfill(4)
    formatter = logging.Formatter(f'{tid_hex} {prefix}> %(message)s')

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    file_handler = logging.FileHandler('app.log')
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger