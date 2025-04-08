
class Hub_Collection:
    def __init__(self):
        self.hubs = {}
        self.connections = {}

    def add_hub(self, game_rec, hub):
        self.hubs[game_rec.token] = hub

        for user in game_rec.users:
            self.connections[user.user_token] = hub.connections[user.username]