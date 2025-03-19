import inspect

def inject_arg(arg_name, object, func, args_dict):
    """
    Injects an argument into the keyword arguments dictionary if the function accepts it.

    Parameters:
        arg_name (str): The name of the argument to inject.
        object (any): The value to inject into the function's arguments.
        func (callable): The function to check for parameter existence.
        args_dict (dict): The existing keyword arguments to be passed to the function.

    Returns:
        dict: The updated keyword arguments dictionary with the injected argument if applicable.

    Usage:
        kwargs = inject_arg("token", token, f, kwargs)
        response = f(**kwargs)
    """

    # Extract the parameter names from the function signature   
    sig = inspect.signature(func)    
    params = list(sig.parameters.keys())

    # If the function accepts the argument, add it to the dictionary
    if arg_name in params:
        args_dict[arg_name] = object

    return args_dict  