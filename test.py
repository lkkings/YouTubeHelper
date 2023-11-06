def create_color_banner(text, text_color, background_color, style=""):
    # ANSI转义码的颜色和样式定义
    color_codes = {
        "black": "30",
        "red": "31",
        "green": "32",
        "yellow": "33",
        "blue": "34",
        "magenta": "35",
        "cyan": "36",
        "white": "37"
    }

    style_codes = {
        "reset": "0",
        "bold": "1",
        "underline": "4",
        "inverse": "7"
    }

    text_color_code = color_codes.get(text_color, "37")  # 默认为白色
    background_color_code = color_codes.get(background_color, "40")  # 默认为黑色
    style_code = style_codes.get(style, "0")  # 默认为重置样式

    # 创建带有ANSI转义码的文本
    colored_text = f"\033[{style_code};{text_color_code};{background_color_code}m{text}\033[0m"

    return colored_text


if __name__ == "__main__":
    text = "Hello, Colorful Banner!"
    text_color = "green"
    background_color = "blue"
    style = "bold"

    banner = create_color_banner(text, text_color, background_color, style)
    print(banner)
