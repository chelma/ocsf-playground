from enum import Enum

"""
This module contains enumerated types for the Regex Expert.
"""

class RegexFlavor(Enum):
    JAVA = "Java" # Java's java.util.regex
    JAVASCRIPT = "JavaScript", # Standard ECMAScript regex (RegExp)
    PCRE = "PCRE", # Perl Compatible Regular Expressions
    POSIX = "POSIX", # POSIX Basic/Extended Regular Expressions
    PYTHON = "Python", # Python's re module
    RE2 = "RE2", # Google's RE2