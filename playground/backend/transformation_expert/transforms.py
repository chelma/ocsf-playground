from abc import ABC, abstractmethod
from dataclasses import dataclass
import logging
from types import ModuleType
from typing import Any, Callable, Dict, List


logger = logging.getLogger("backend")


class TransformBase(ABC):
    @abstractmethod
    def to_json(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def to_file_format(self) -> str:
        pass

@dataclass
class TransformPython(TransformBase):
    imports: str
    description: str
    code: str

    def to_json(self) -> Dict[str, str]:
        return {
            "imports": self.imports,
            "description": self.description,
            "code": self.code
        }
    
    def to_file_format(self) -> str:
        return f"{self.imports}\n\n\"\"\"\n{self.description}\n\"\"\"\n\n{self.code}"

class TransformInvalidSyntaxError(Exception):
    pass

class TransformNotInModuleError(Exception):
    pass

class TransformNotExecutableError(Exception):
    pass

def load_transform(transform: TransformBase) -> Callable[[Dict[str, Any]], List[Dict[str, Any]]]:
    # Take the raw transform logic and attempt to load it into an executable form
    try:
        transform_module = ModuleType("transform")
        exec(transform.to_file_format(), transform_module.__dict__)
    except SyntaxError as e:
        raise TransformInvalidSyntaxError(f"Syntax error in the transform code: {str(e)}")

    # Confirm we can pull out a usable transform
    if not hasattr(transform_module, "transform"):
        raise TransformNotInModuleError("The transform module does not contain a member named 'transform'")
    
    if not callable(transform_module.transform):
        raise TransformNotExecutableError("The 'transform' attribute must be an executable function")
    
    return transform_module.transform