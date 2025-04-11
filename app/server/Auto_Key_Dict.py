class Auto_Key_Dict(dict):
    def __init__(self, key_field, initial_values = None):
        super().__init__()
        self.key_field = key_field
        if initial_values: self.add(initial_values)

    def add(self, value):
        if isinstance(value, list):
            for item in value: self.add(value)
        else:            
            key = getattr(value, self.key_field, None)
            if key is None:
                raise ValueError(f"Value missing field '{self.key_field}'")
            self[key] = value