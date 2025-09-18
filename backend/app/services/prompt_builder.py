def build_prompt(base: str, genre: str = None, instruments: list = None) -> str:
    prompt = base
    if genre:
        prompt += f" in the style of {genre}"
    if instruments:
        prompt += f" with {', '.join(instruments)}"
    return prompt
