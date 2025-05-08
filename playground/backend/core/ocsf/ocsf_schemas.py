from dataclasses import dataclass
import json

from typing import Any, Dict, List, Callable

from ocsf.schema import OcsfAttr, OcsfEvent, OcsfObject, OcsfSchema

@dataclass
class PrintableOcsfAttr(OcsfAttr):
    def json_simplified(self) -> Dict[str, Any]:
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
    def json_simplified(self) -> Dict[str, Any]:
        """
        Convert the event to a simplified JSON.
        """
        return {
            "caption": self.caption,
            "description": self.description,
            "name": self.name,
            "uid": self.uid,
            "attributes": {
                attr_name: PrintableOcsfAttr(**attr.__dict__).json_simplified()
                for attr_name, attr in self.attributes.items()
            }
        }

@dataclass
class PrintableOcsfObject(OcsfObject):
    def json_simplified(self) -> Dict[str, Any]:
        """
        Convert the object to a simplified JSON.
        """
        return {
            "caption": self.caption,
            "description": self.description,
            "name": self.name,
            "attributes": {
                attr_name: PrintableOcsfAttr(**attr.__dict__).json_simplified()
                for attr_name, attr in self.attributes.items()
            }
        }

def make_get_ocsf_event_schema(schema: OcsfSchema) -> Callable[[str], PrintableOcsfEvent]:
    def get_ocsf_event_schema(event_name: str) -> PrintableOcsfEvent:
        """
        Given an OCSF event class name, return the schema for that event class.
        """
        # Check if the event class is valid
        event_class = next((e_class for e_class in schema.classes.values() if e_class.caption == event_name), None)
        if event_class is None:
            raise ValueError(f"Invalid event class: {event_name}")

        # Convert the schema to a WrappedOcsfEvent
        wrapped_event = PrintableOcsfEvent(**event_class.__dict__)

        return wrapped_event
    
    return get_ocsf_event_schema

def make_get_ocsf_object_schemas(schema: OcsfSchema) -> Callable[[str], List[PrintableOcsfObject]]:
    def get_ocsf_object_schemas(event_name: str) -> List[PrintableOcsfObject]:
        """
        Given an OCSF event class name, return the schemas of all shapes used by that category.
        """
        # Check if the event class is valid
        event_class = next((e_class for e_class in schema.classes.values() if e_class.caption == event_name), None)
        if event_class is None:
            raise ValueError(f"Invalid event class: {event_name}")

        # Get the objects that the schema uses at the top level
        objects_to_process: List[OcsfObject] = []
        for attribute_name, attribute in event_class.attributes.items():
            if attribute.is_object():
                objects_to_process.append(schema.objects[attribute.object_type])

        # Now, for each object at the top level, get recursively retrieve the objects they use
        returned_objects = dict()

        while objects_to_process:
            # Get the next object and add it to the final list to return
            next_object = objects_to_process.pop(0)
            returned_objects[next_object.name] = next_object

            # If it has any attributes that are also objects, add them to the list if they have not already
            # been processed
            for attribute_name, attribute in next_object.attributes.items():
                if attribute.is_object() and attribute.object_type not in returned_objects:
                    objects_to_process.append(schema.objects[attribute.object_type])

        # Convert the objects to a list of WrappedOcsfObject
        wrapped_objects = [PrintableOcsfObject(**obj.__dict__) for obj in returned_objects.values()]

        return wrapped_objects
    
    return get_ocsf_object_schemas


