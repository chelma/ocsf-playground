import json

from typing import Any, Dict, List, Callable


def make_get_ocsf_category_schema(category_schemas: List[Dict[str, Any]]) -> Callable[[str], str]:
    def get_ocsf_category_schema(category_name: str) -> str:
        """
        Given an OCSF category name, return the schema for that category.
        """
        # Check if the category is valid
        if category_name not in [cat["name"] for cat in category_schemas]:
            raise ValueError(f"Invalid category: {category_name}")

        # Get the schema for the specified category
        category_schema = next(cat for cat in category_schemas if cat["name"] == category_name)
            
        return json.dumps(category_schema, indent=4)
    
    return get_ocsf_category_schema

def make_get_ocsf_shape_schemas(category_schemas: List[Dict[str, Any]], shape_schemas: List[Dict[str, Any]]) -> Callable[[str], str]:
    def get_ocsf_shape_schemas(category_name: str) -> str:
        """
        Given an OCSF category name, return the schemas of all shapes used by that category.
        """
        # Check if the category is valid
        if category_name not in [cat["name"] for cat in category_schemas]:
            raise ValueError(f"Invalid category: {category_name}")

        # Get the schema for the specified category
        category_schema = next(cat for cat in category_schemas if cat["name"] == category_name)

        # Get the shapes that the schema uses
        shapes = []
        for field in category_schema["fields"]:
            if field["data_type"] in [shape["name"] for shape in shape_schemas]:
                shapes.append(next(shape for shape in shape_schemas if shape["name"] == field["data_type"]))
            
        return json.dumps(shapes, indent=4)
    
    return get_ocsf_shape_schemas


