from euchre.class_getter import class_getter
from Socket_Connection import Socket_Connection

class Hub_Dictionary(dict):
    _singleton = None

    @class_getter
    def singleton():
        if Hub_Dictionary._singleton is None:
            Hub_Dictionary._singleton = Hub_Dictionary()
        return Hub_Dictionary._singleton

    def __init__(self):
        self.sid_dict = {}
        self.user_dict = {}

    def get_connection(self, sid):
        if not sid in self.sid_dict:
            raise Exception("Unknown socket identifier in hub dictionary")        
        return self.sid_dict[sid]

    def has_sid(self, sid):
        return sid in self.sid_dict
    
    def has_user(self, sid):
        return sid in self.user_dict

    def set_sid(self, hub_id, username, sid):
        if not hub_id in self: 
            raise Exception("Unknown hub identifier in hub dictionary")
        hub = self[hub_id]
        
        if not username in hub: 
            raise Exception("Unknown username in hub")
        socket_connection = hub[username]
        
        if not isinstance(socket_connection, Socket_Connection):
            raise Exception(f"Incorrect type, expected 'Socket_Connection' found '{type(socket_connection).__name__}'")
        
        self.sid_dict[sid] = socket_connection
        self.user_dict[username] = socket_connection
        socket_connection.connect(sid)

    def clear_sid(self, sid):
        if sid in self.sid_dict:
            socket_connection = self.sid_dict[sid]
            socket_connection.disconnect()
        
        