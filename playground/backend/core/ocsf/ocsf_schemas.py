from dataclasses import dataclass

from typing import Any, Dict, List, Callable, Tuple

from ocsf.schema import OcsfAttr, OcsfEvent, OcsfObject, OcsfSchema

@dataclass
class PrintableOcsfAttr(OcsfAttr):
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the attribute to a simplified JSON.
        """
        return {
            "caption": self.caption,
            "description": self.description,
            "type": self.type,
            "type_name": self.type_name,
            "object_type": self.object_type,
            "object_name": self.object_name,
            "requirement": self.requirement,
            "is_array": self.is_array,
            "enum": [
                {
                    "name": enum_name,
                    "value": enum_value.caption,
                    "description": enum_value.description
                }
                for enum_name, enum_value in self.enum.items()
            ] if self.enum else None,
        }


@dataclass
class PrintableOcsfEvent(OcsfEvent):
    attrs_to_include: List[str] = None

    def to_dict(self, filter_attributes: bool = False) -> Dict[str, Any]:
        """
        Convert the event to a simplified JSON.  Optionally, only include the attributes specified.
        """

        if filter_attributes and not self.attrs_to_include:
            filtered_attributes = {}
        elif filter_attributes and self.attrs_to_include:
            filtered_attributes = {attr_name: attr for attr_name, attr in self.attributes.items() if attr_name in self.attrs_to_include}
        else:
            filtered_attributes = self.attributes

        return {
            "caption": self.caption,
            "description": self.description,
            "name": self.name,
            "uid": self.uid,
            "attributes": {
                attr_name: PrintableOcsfAttr(**attr.__dict__).to_dict()
                for attr_name, attr in filtered_attributes.items()
            }
        }

@dataclass
class PrintableOcsfObject(OcsfObject):
    include_all_attrs: bool = False
    attrs_to_include: List[str] = None

    def __init__(self, *args, **kwargs):
        self.include_all_attrs = kwargs.pop("include_all_attrs", False)
        self.attrs_to_include = kwargs.pop("attrs_to_include", None)
        super().__init__(*args, **kwargs)

        if self.include_all_attrs and self.attrs_to_include:
            raise ValueError("Cannot specify to include all attributes and a specific list of attributes to filter out at the same time.")

    def to_dict(self, filter_attributes: bool = False) -> Dict[str, Any]:
        """
        Convert the object to a simplified JSON.  Optionally, only include the attributes specified.
        """

        if self.include_all_attrs:
            filtered_attributes = self.attributes
        elif filter_attributes and not self.attrs_to_include:
            filtered_attributes = {}
        elif filter_attributes and self.attrs_to_include:
            filtered_attributes = {attr_name: attr for attr_name, attr in self.attributes.items() if attr_name in self.attrs_to_include}
        else:
            filtered_attributes = self.attributes

        return {
            "caption": self.caption,
            "description": self.description,
            "name": self.name,
            "attributes": {
                attr_name: PrintableOcsfAttr(**attr.__dict__).to_dict()
                for attr_name, attr in filtered_attributes.items()
            }
        }

def make_get_ocsf_event_schema(schema: OcsfSchema) -> Callable[[str], PrintableOcsfEvent]:
    def get_ocsf_event_schema(event_name: str, paths: List[str]) -> PrintableOcsfEvent:
        """
        Given an OCSF event class name, return the schema for that event class.
        """
        filtered_attributes = [attr_name.split(".")[0] for attr_name in paths]

        # Check if the event class is valid
        event_class = next((e_class for e_class in schema.classes.values() if e_class.caption == event_name), None)
        if event_class is None:
            raise ValueError(f"Invalid event class: {event_name}")

        # Convert the schema to a PrintableOcsfEvent
        printable_event = PrintableOcsfEvent(**event_class.__dict__, attrs_to_include=filtered_attributes)

        return printable_event
    
    return get_ocsf_event_schema

def make_get_ocsf_object_schemas(schema: OcsfSchema) -> Callable[[str], List[PrintableOcsfObject]]:
    def get_ocsf_object_schemas(event_name: str, paths: List[str]) -> List[PrintableOcsfObject]:
        """
        Given an OCSF event class name, return the schemas of all objects used by that category.
        """

        # Check if the event class is valid
        event_class = next((e_class for e_class in schema.classes.values() if e_class.caption == event_name), None)
        if event_class is None:
            raise ValueError(f"Invalid event class: {event_name}")

        # Get the objects that the schema uses at the top level
        objects_to_process: List[Tuple[str, OcsfObject]] = []
        for attribute_name, attribute in event_class.attributes.items():
            if attribute.is_object():
                objects_to_process.append((attribute_name, schema.objects[attribute.object_type]))

        # Now, for each object at the top level, get recursively retrieve the objects they use
        returned_objects: Dict[str, OcsfObject] = dict() # Mapping of object type name to object
        relevant_attributes: Dict[str, List[str]] = dict() # Mapping of object type name to list of attributes that are relevant to the paths
        object_was_leaf: Dict[str, bool] = dict() # Mapping of object type name to whether it was a leaf in a path

        while objects_to_process:
            # Get the next object and add it to the final list to return
            next_path, next_object = objects_to_process.pop(0)
            returned_objects[next_object.name] = next_object

            if next_path in paths:
                object_was_leaf[next_object.name] = True

            # If it has any attributes that are also objects, add them to the list if they have not already
            # been processed
            for attribute_name, attribute in next_object.attributes.items():
                attribute_path = f"{next_path}.{attribute_name}"

                # Mark the attribute as relevant if it is a leaf or a transition point in a path
                attribute_is_leaf = attribute_path in paths
                attribute_is_transition = any(path.startswith(attribute_path) for path in paths)
                if attribute_is_leaf or attribute_is_transition:
                    if next_object.name not in relevant_attributes:
                        relevant_attributes[next_object.name] = []
                    if attribute_name not in relevant_attributes[next_object.name]:
                        relevant_attributes[next_object.name].append(attribute_name)

                # If the attribute is an object, process it as well
                if attribute.is_object() and attribute.object_type not in returned_objects:
                    objects_to_process.append((attribute_path, schema.objects[attribute.object_type]))

        # Convert the objects to a list of PrintableOcsfObject, using each object's stored path
        printable_objects = []
        for obj_name, obj in returned_objects.items():
            should_include_all_attrs = obj_name in object_was_leaf # If it was ever a leaf, we want to include all attributes
            filtered_attributes = relevant_attributes.get(obj_name, []) if not should_include_all_attrs else []

            printable_objects.append(PrintableOcsfObject(**obj.__dict__, include_all_attrs=should_include_all_attrs, attrs_to_include=filtered_attributes))

        return printable_objects
    
    return get_ocsf_object_schemas


