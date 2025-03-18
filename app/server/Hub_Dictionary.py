from euchre.class_getter import class_getter

class Hub_Dictionary(dict):
    _singleton = None

    @class_getter
    def singleton():
        if Hub_Dictionary._singleton is None:
            Hub_Dictionary._singleton = Hub_Dictionary()
        return Hub_Dictionary._singleton
