# This JSON blob was created with some prompt engineering and manually pasting portions of the OCSF documentation into
# a GenAI prompt.
# 
# See: https://schema.ocsf.io/1.1.0/
# See: https://chatgpt.com/share/67ed81bd-4c64-8001-8824-6084c99a76fe
OCSF_CATEGORIES = [
    {
        "category_name": "File System Activity",
        "category_id": "1001",
        "category_details": "The File System Activity category covers file system events for: creating new files, reading data from a file, writing data to a file, deleting a file, renaming a file, setting file attributes, getting file attributes, getting security details for a file, encrypting a file, decrypting a file, mounting a file, unmounting a file, or opening a file."
    },
    {
        "category_name": "Kernel Extension Activity",
        "category_id": "1002",
        "category_details": "The Kernel Extension Activity category covers kernel-level events involving drivers or extensions being loaded into or unloaded from the kernel."
    },
    {
        "category_name": "Kernel Activity",
        "category_id": "1003",
        "category_details": "The Kernel Activity category covers events where a process interacts with kernel resources by creating, reading, deleting, or invoking them."
    },
    {
        "category_name": "Memory Activity",
        "category_id": "1004",
        "category_details": "The Memory Activity category covers events where a process performs memory-related operations such as allocating or modifying memory pages, deleting pages, triggering a buffer overflow, disabling or enabling Data Execution Protection (DEP), or reading and writing memory (e.g., using ReadProcessMemory or WriteProcessMemory)."
    },
    {
        "category_name": "Module Activity",
        "category_id": "1005",
        "category_details": "The Module Activity category covers events where a process loads or unloads a module."
    },
    {
        "category_name": "Scheduled Job Activity",
        "category_id": "1006",
        "category_details": "The Scheduled Job Activity category covers events related to scheduled jobs or tasks, including creating, updating, deleting, enabling, disabling, or starting a scheduled job."
    },
    {
        "category_name": "Process Activity",
        "category_id": "1007",
        "category_details": "The Process Activity category covers events where a process launches, terminates, opens, or injects into another process, or sets the user ID of a process."
    },
    {
        "category_name": "Account Change",
        "category_id": "3001",
        "category_details": "The Account Change category covers user account management events such as creating, enabling, disabling, deleting, or locking a user or role; changing or resetting a password; attaching or detaching IAM policies; and enabling or disabling multi-factor authentication (MFA) factors."
    },
    {
        "category_name": "Authentication",
        "category_id": "3002",
        "category_details": "The Authentication category covers events related to authentication session activities such as user logon and logoff attempts, Kerberos authentication ticket requests, service ticket requests, and ticket renewals. It also includes identification of the authentication protocol used, such as NTLM, Kerberos, Digest, OpenID, SAML, OAUTH 2.0, PAP, CHAP, EAP, or RADIUS."
    },
    {
        "category_name": "Authorize Session",
        "category_id": "3003",
        "category_details": "The Authorize Session category covers events where privileges or groups are assigned to a new user session, typically during login. This includes assigning special privileges or group memberships to the session."
    },
    {
        "category_name": "Entity Management",
        "category_id": "3004",
        "category_details": "The Entity Management category covers create, read, update, and delete (CRUD) operations performed on managed entities by a managed client, microservice, or user at a management console."
    },
    {
        "category_name": "User Access Management",
        "category_id": "3005",
        "category_details": "The User Access Management category covers events where user privileges are updated, including assigning or revoking privileges."
    },
    {
        "category_name": "Group Management",
        "category_id": "3006",
        "category_details": "The Group Management category covers events related to group management, including creating or deleting groups, assigning or revoking group privileges, and adding or removing users from groups."
    },
    {
        "category_name": "Network Activity",
        "category_id": "4001",
        "category_details": "The Network Activity category covers events related to network connections and traffic, including opening and closing connections, abnormal terminations (resets), connection failures, connection refusals, and reporting on network traffic."
    },
    {
        "category_name": "HTTP Activity",
        "category_id": "4002",
        "category_details": "The HTTP Activity category covers events related to HTTP connection and traffic information, including standard HTTP methods such as CONNECT, DELETE, GET, HEAD, OPTIONS, POST, PUT, and TRACE."
    },
    {
        "category_name": "DNS Activity",
        "category_id": "4003",
        "category_details": "The DNS Activity category covers events related to DNS queries and responses observed on the network, including DNS requests, responses, and bidirectional traffic."
    },
    {
        "category_name": "DHCP Activity",
        "category_id": "4004",
        "category_details": "The DHCP Activity category covers events related to Dynamic Host Configuration Protocol (DHCP) operations, including MAC to IP address assignments. This includes events such as DHCP Discover, Offer, Request, Decline, Acknowledgment (Ack), Negative Acknowledgment (Nak), Release, Inform, and Expire."
    },
    {
        "category_name": "RDP Activity",
        "category_id": "4005",
        "category_details": "The RDP Activity category covers events related to Remote Desktop Protocol (RDP) connections observed on the network, including initial requests and responses, connection requests and responses, TLS handshakes, and ongoing network traffic."
    },
    {
        "category_name": "SMB Activity",
        "category_id": "4006",
        "category_details": "The SMB Activity category covers events related to Server Message Block (SMB) protocol connections used for sharing resources over a network. This includes file operations such as superseding, opening, creating, and overwriting files, depending on whether the file exists or not."
    },
    {
        "category_name": "SSH Activity",
        "category_id": "4007",
        "category_details": "The SSH Activity category covers events related to Secure Shell (SSH) protocol connections, including opening and closing network connections, abnormal terminations, connection failures, connection refusals, and general SSH traffic observed on the network."
    },
    {
        "category_name": "FTP Activity",
        "category_id": "4008",
        "category_details": "The FTP Activity category covers events related to file transfers using the File Transfer Protocol (FTP) or Secure FTP (SFTP), including file uploads (Put), downloads (Get), directory polling, file deletions, renaming files, and listing directory contents."
    },
    {
        "category_name": "Email Activity",
        "category_id": "4009",
        "category_details": "The Email Activity category covers events related to the sending, receiving, and scanning of emails. It also includes the direction of the email relative to the scanning host or organization, such as inbound from the internet, outbound to the internet, or internal within the organization."
    },
    {
        "category_name": "Network File Activity",
        "category_id": "4010",
        "category_details": "The Network File Activity category (deprecated since v1.1.0) covered events related to file activities occurring over the network, including actions on file storage services such as Box, MS OneDrive, or Google Drive. Activities included uploading, downloading, updating, deleting, renaming, copying, moving, restoring, previewing, locking, unlocking, sharing, unsharing, opening, and syncing or unsyncing files or folders. This category has been replaced by the 'File Hosting Activity' class in the 'Application' category."
    },
    {
        "category_name": "Email File Activity",
        "category_id": "4011",
        "category_details": "The Email File Activity category covers events related to files contained within emails, including sending, receiving, and scanning of email attachments (e.g., for security purposes)."
    },
    {
        "category_name": "Email URL Activity",
        "category_id": "4012",
        "category_details": "The Email URL Activity category covers events related to URLs contained within emails, including sending, receiving, and scanning of email URLs (e.g., for security purposes)."
    },
    {
        "category_name": "NTP Activity",
        "category_id": "4013",
        "category_details": "The NTP Activity category covers events related to the Network Time Protocol (NTP), where remote clients synchronize their clocks with NTP servers. This includes symmetric active exchanges, symmetric passive responses, client synchronization, server responses, broadcast messages, control messaging, and reserved private use cases."
    },
    {
        "category_name": "Device Inventory Info",
        "category_id": "5001",
        "category_details": "The Device Inventory Info category covers events that report device inventory data obtained either through logs or proactive collection methods, such as querying a CMDB or performing a network sweep to discover connected devices."
    },
    {
        "category_name": "Device Config State",
        "category_id": "5002",
        "category_details": "The Device Config State category covers events that report device configuration data, including results from CIS Benchmarks, obtained through logging or active collection processes."
    },
    {
        "category_name": "User Inventory Info",
        "category_id": "5003",
        "category_details": "The User Inventory Info category covers events that report user inventory data obtained either through logs or proactive collection methods, such as gathering user information from Active Directory entries."
    },
    {
        "category_name": "Operating System Patch State",
        "category_id": "5004",
        "category_details": "The Operating System Patch State category covers events that report the installation status of operating system patches on devices, including any associated knowledgebase articles. This information can be obtained through logging or active collection processes."
    },
    {
        "category_name": "Device Config State Change",
        "category_id": "5019",
        "category_details": "The Device Config State Change category covers events that report changes in device configuration state which impact the security posture of the device. These changes can be identified through logs or active collection methods."
    },
    {
        "category_name": "Web Resources Activity",
        "category_id": "6001",
        "category_details": "The Web Resources Activity category covers events involving actions on web resources, including creating, reading, updating, deleting, searching, importing, exporting, and sharing web resources within an application."
    },
    {
        "category_name": "Application Lifecycle",
        "category_id": "6002",
        "category_details": "The Application Lifecycle category covers events related to the lifecycle of an application or service, including installation, removal, start, and stop actions."
    },
    {
        "category_name": "API Activity",
        "category_id": "6003",
        "category_details": "The API Activity category covers general CRUD (Create, Read, Update, Delete) operations performed through API calls, such as those seen in services like AWS CloudTrail."
    },
    {
        "category_name": "Web Resource Access Activity",
        "category_id": "6004",
        "category_details": "The Web Resource Access Activity category (deprecated since v1.0.0) covered events describing successful or failed attempts to access web resources over HTTP. This included access grants, denials, revocations due to security policies, and access errors. It has been replaced by the Web Resources Activity class used in combination with the Security Control and/or Network Proxy profiles."
    },
    {
        "category_name": "Datastore Activity",
        "category_id": "6005",
        "category_details": "The Datastore Activity category covers general operations affecting datastores or the data within them, such as read, update, connect, query, write, create, and delete actions. This includes activity on services like AWS RDS and AWS S3."
    },
    {
        "category_name": "File Hosting Activity",
        "category_id": "6006",
        "category_details": "The File Hosting Activity category covers actions performed by file management applications and file sharing services such as SharePoint, Box, MS OneDrive, and Google Drive. These actions include uploading, downloading, updating, deleting, renaming, copying, moving, restoring, previewing, locking, unlocking, sharing, unsharing, opening, and syncing or unsyncing files or folders."
    },
    {
        "category_name": "Scan Activity",
        "category_id": "6007",
        "category_details": "The Scan Activity category covers events related to the execution of scan jobs, including their start, completion, cancellation, and results. It also captures issues such as duration violations, pause violations, errors, and user-driven actions like pausing, resuming, restarting, or delaying scans. The event includes metadata such as the number of items scanned and the number of detections resolved."
    }
]


# These JSON blobs were created with some prompt engineering and manually pasting portions of the OCSF documentation into
# a GenAI prompt.
# 
# See: https://schema.ocsf.io/1.1.0/
# See: https://chatgpt.com/share/67f00fed-5e84-8001-8f0a-acb8ca48319a
OCSF_CATEGORY_SCHEMAS = [
    {
        "name": "Authentication",
        "fields": [
            {
                "name": "auth_protocol_id",
                "data_type": "Integer",
                "description": "The normalized identifier of the authentication protocol used to create the user session.",
                "enum_values": {
                    "0": "Unknown",
                    "1": "NTLM",
                    "2": "Kerberos",
                    "3": "Digest",
                    "4": "OpenID",
                    "5": "SAML",
                    "6": "OAUTH 2.0",
                    "7": "PAP",
                    "8": "CHAP",
                    "9": "EAP",
                    "10": "RADIUS",
                    "99": "Other"
                },
                "requirement": "Recommended"
            },
            {
                "name": "activity_id",
                "data_type": "Integer",
                "description": "The normalized identifier of the activity that triggered the event.",
                "enum_values": {
                    "0": "Unknown",
                    "1": "Logon",
                    "2": "Logoff",
                    "3": "Authentication Ticket",
                    "4": "Service Ticket Request",
                    "5": "Service Ticket Renew",
                    "99": "Other"
                },
                "requirement": "Required"
            },
            {
                "name": "category_uid",
                "data_type": "Integer",
                "description": "The category unique identifier of the event. For Identity & Access Management events related to authentication and access control.",
                "enum_values": {
                    "3": "Identity & Access Management"
                },
                "requirement": "Required"
            },
            {
                "name": "class_uid",
                "data_type": "Integer",
                "description": "The unique identifier of a class describing the attributes available in an event.",
                "enum_values": {
                    "3002": "Authentication: Authentication events report authentication session activities such as user attempts a logon or logoff, successfully or otherwise."
                },
                "requirement": "Required"
            },
            {
                "name": "logon_type_id",
                "data_type": "Integer",
                "description": "The normalized logon type identifier.",
                "enum_values": {
                    "0": "System",
                    "2": "Interactive",
                    "3": "Network",
                    "4": "Batch",
                    "5": "OS Service",
                    "7": "Unlock",
                    "8": "Network Cleartext",
                    "9": "New Credentials",
                    "10": "Remote Interactive",
                    "11": "Cached Interactive",
                    "12": "Cached Remote Interactive",
                    "13": "Cached Unlock",
                    "99": "Other"
                },
                "requirement": "Recommended"
            },
            {
                "name": "message",
                "data_type": "String",
                "description": "The description of the event/finding as defined by the source.",
                "requirement": "Recommended"
            },
            {
                "name": "severity_id",
                "data_type": "Integer",
                "description": "The normalized identifier of the event/finding severity. Lower values represent lower impact events; higher values represent higher impact events.",
                "enum_values": {
                    "0": "Unknown",
                    "1": "Informational",
                    "2": "Low",
                    "3": "Medium",
                    "4": "High",
                    "5": "Critical",
                    "6": "Fatal",
                    "99": "Other"
                },
                "requirement": "Required"
            },
            {
                "name": "src_endpoint",
                "data_type": "Network Endpoint",
                "description": "The source network endpoint from which the authentication originated.",
                "requirement": "Optional"
            },
            {
                "name": "status_id",
                "data_type": "Integer",
                "description": "The normalized identifier of the event status.",
                "enum_values": {
                    "0": "Unknown",
                    "1": "Success",
                    "2": "Failure",
                    "99": "Other"
                },
                "requirement": "Recommended"
            },
            {
                "name": "timezone_offset",
                "data_type": "Integer",
                "description": "The number of minutes that the reported event time is ahead or behind UTC, in the range -1080 to +1080.",
                "requirement": "Recommended"
            },
            {
                "name": "time",
                "data_type": "Timestamp",
                "description": "The normalized event occurrence time or the finding creation time.",
                "requirement": "Required"
            },
            {
                "name": "type_uid",
                "data_type": "Long",
                "description": "The event/finding type ID. It identifies the event's semantics and structure. Calculated as: class_uid * 100 + activity_id.",
                "enum_values": {
                    "300200": "Authentication: Unknown",
                    "300201": "Authentication: Logon",
                    "300202": "Authentication: Logoff",
                    "300203": "Authentication: Authentication Ticket",
                    "300204": "Authentication: Service Ticket Request",
                    "300205": "Authentication: Service Ticket Renew",
                    "300299": "Authentication: Other"
                },
                "requirement": "Required"
            },
            {
                "name": "user",
                "data_type": "User",
                "description": "The subject (user/role or account) to authenticate.",
                "requirement": "Required"
            }
        ]
    },
    {
        "name": "HTTP Activity",
        "fields": [
            {
                "name": "activity_id",
                "data_type": "Integer",
                "description": "The normalized identifier of the activity that triggered the event. Possible values: 0 (Unknown), 1 (Connect), 2 (Delete), 3 (Get), 4 (Head), 5 (Options), 6 (Post), 7 (Put), 8 (Trace), 99 (Other).",
                "enum_values": {
                    "0": "Unknown",
                    "1": "Connect",
                    "2": "Delete",
                    "3": "Get",
                    "4": "Head",
                    "5": "Options",
                    "6": "Post",
                    "7": "Put",
                    "8": "Trace",
                    "99": "Other"
                },
                "requirement": "Required"
            },
            {
                "name": "category_uid",
                "data_type": "Integer",
                "description": "The category unique identifier of the event. For Network Activity events, the value is 4.",
                "enum_values": {
                    "4": "Network Activity"
                },
                "requirement": "Required"
            },
            {
                "name": "class_name",
                "data_type": "String",
                "description": "The event class name, as defined by the class_uid value for HTTP Activity events.",
                "requirement": "Optional"
            },
            {
                "name": "class_uid",
                "data_type": "Integer",
                "description": "The unique identifier of a class. A Class describes the attributes available in an event. For HTTP Activity, the value is 4002.",
                "enum_values": {
                    "4002": "HTTP Activity"
                },
                "requirement": "Required"
            },
            {
                "name": "http_request",
                "data_type": "HTTP Request",
                "description": "The HTTP Request object documenting attributes of a request made to a web server.",
                "requirement": "Required"
            },
            {
                "name": "http_response",
                "data_type": "HTTP Response",
                "description": "The HTTP Response from a web server to a requester.",
                "requirement": "Required"
            },
            {
                "name": "message",
                "data_type": "String",
                "description": "The description of the event/finding, as defined by the source.",
                "requirement": "Recommended"
            },
            {
                "name": "raw_data",
                "data_type": "String",
                "description": "The raw event/finding data as received from the source.",
                "requirement": "Optional"
            },
            {
                "name": "severity_id",
                "data_type": "Integer",
                "description": "The normalized identifier of the event/finding severity. Possible values: 0 (Unknown), 1 (Informational), 2 (Low), 3 (Medium), 4 (High), 5 (Critical), 6 (Fatal), 99 (Other).",
                "enum_values": {
                    "0": "Unknown",
                    "1": "Informational",
                    "2": "Low",
                    "3": "Medium",
                    "4": "High",
                    "5": "Critical",
                    "6": "Fatal",
                    "99": "Other"
                },
                "requirement": "Required"
            },
            {
                "name": "src_endpoint",
                "data_type": "Network Endpoint",
                "description": "The initiator (client) of the network connection.",
                "requirement": "Required"
            },
            {
                "name": "status_code",
                "data_type": "String",
                "description": "The event status code as reported by the event source.",
                "requirement": "Optional"
            },
            {
                "name": "status_detail",
                "data_type": "String",
                "description": "The status details containing additional information about the event/finding outcome.",
                "requirement": "Optional"
            },
            {
                "name": "status_id",
                "data_type": "Integer",
                "description": "The normalized identifier of the event status. Possible values: 0 (Unknown), 1 (Success), 2 (Failure), 99 (Other).",
                "enum_values": {
                    "0": "Unknown",
                    "1": "Success",
                    "2": "Failure",
                    "99": "Other"
                },
                "requirement": "Recommended"
            },
            {
                "name": "time",
                "data_type": "Timestamp",
                "description": "The normalized event occurrence time or the finding creation time.",
                "requirement": "Required"
            },
            {
                "name": "timezone_offset",
                "data_type": "Integer",
                "description": "The number of minutes that the reported event time is ahead or behind UTC, in the range -1080 to +1080.",
                "requirement": "Recommended"
            },
            {
                "name": "type_uid",
                "data_type": "Long",
                "description": "The event/finding type ID. It identifies the event's semantics and structure. Calculated as: class_uid * 100 + activity_id.",
                "enum_values": {
                    "400200": "HTTP Activity: Unknown",
                    "400201": "HTTP Activity: Connect",
                    "400202": "HTTP Activity: Delete",
                    "400203": "HTTP Activity: Get",
                    "400204": "HTTP Activity: Head",
                    "400205": "HTTP Activity: Options",
                    "400206": "HTTP Activity: Post",
                    "400207": "HTTP Activity: Put",
                    "400208": "HTTP Activity: Trace",
                    "400299": "HTTP Activity: Other"
                },
                "requirement": "Required"
            }
        ]
    }
]

OCSF_SHAPE_SCHEMAS = [
    {
        "name": "HTTP Header",
        "fields": [
            {
                "name": "name",
                "data_type": "String",
                "description": "The name of the header.",
                "requirement": "Required"
            },
            {
                "name": "value",
                "data_type": "String",
                "description": "The value of the header.",
                "requirement": "Required"
            }
        ]
    },
    {
        "name": "HTTP Request",
        "fields": [
            {
                "name": "http_headers",
                "data_type": "HTTP Header Array",
                "description": "Additional HTTP headers of an HTTP request or response.",
                "requirement": "Recommended"
            },
            {
                "name": "http_method",
                "data_type": "String",
                "description": "The HTTP request method indicates the desired action to be performed for a given resource.",
                "enum_values": {
                    "CONNECT": "Connect",
                    "DELETE": "Delete",
                    "GET": "Get",
                    "HEAD": "Head",
                    "OPTIONS": "Options",
                    "POST": "Post",
                    "PUT": "Put",
                    "TRACE": "Trace"
                },
                "requirement": "Optional"
            },
            {
                "name": "length",
                "data_type": "Integer",
                "description": "The HTTP request length, in number of bytes.",
                "requirement": "Optional"
            },
            {
                "name": "uid",
                "data_type": "String",
                "description": "The unique identifier of the http request.",
                "requirement": "Optional"
            },
            {
                "name": "url",
                "data_type": "Uniform Resource Locator",
                "description": "The URL object that pertains to the request.",
                "requirement": "Recommended"
            },
            {
                "name": "user_agent",
                "data_type": "String",
                "description": "The request header that identifies the operating system and web browser.",
                "requirement": "Recommended"
            },
            {
                "name": "version",
                "data_type": "String",
                "description": "The Hypertext Transfer Protocol (HTTP) version.",
                "requirement": "Recommended"
            }
        ]
    },
    {
        "name": "HTTP Response",
        "fields": [
            {
                "name": "code",
                "data_type": "Integer",
                "description": "The HTTP status code returned from the web server to the client. For example, 200.",
                "requirement": "Required"
            },
            {
                "name": "http_headers",
                "data_type": "HTTP Header Array",
                "description": "Additional HTTP headers of the response.",
                "requirement": "Recommended"
            },
            {
                "name": "latency",
                "data_type": "Integer",
                "description": "The HTTP response latency measured in milliseconds.",
                "requirement": "Optional"
            },
            {
                "name": "length",
                "data_type": "Integer",
                "description": "The HTTP response length, in number of bytes.",
                "requirement": "Optional"
            },
            {
                "name": "message",
                "data_type": "String",
                "description": "The description of the event/finding, as defined by the source.",
                "requirement": "Optional"
            }
        ]
    },
    {
        "name": "Network Endpoint",
        "fields": [
            {
                "name": "name",
                "data_type": "String",
                "description": "The short name of the endpoint.",
                "requirement": "Recommended"
            },
            {
                "name": "hostname",
                "data_type": "Hostname",
                "description": "The fully qualified name of the endpoint.",
                "requirement": "Recommended"
            },
            {
                "name": "interface_name",
                "data_type": "String",
                "description": "The name of the network interface (e.g. eth2).",
                "requirement": "Recommended"
            },
            {
                "name": "interface_uid",
                "data_type": "String",
                "description": "The unique identifier of the network interface.",
                "requirement": "Recommended"
            },
            {
                "name": "ip",
                "data_type": "IP Address",
                "description": "The IP address of the endpoint, in either IPv4 or IPv6 format.",
                "requirement": "Recommended"
            },
            {
                "name": "port",
                "data_type": "Port",
                "description": "The port used for communication within the network connection.",
                "requirement": "Recommended"
            },
            {
                "name": "svc_name",
                "data_type": "String",
                "description": "The service name in service-to-service connections. For example, AWS VPC logs that identify the connection is coming from or going to an AWS service.",
                "requirement": "Recommended"
            },
            {
                "name": "uid",
                "data_type": "String",
                "description": "The unique identifier of the endpoint.",
                "requirement": "Recommended"
            },
            {
                "name": "vpc_uid",
                "data_type": "String",
                "description": "The unique identifier of the Virtual Private Cloud (VPC).",
                "requirement": "Optional"
            },
            {
                "name": "zone",
                "data_type": "String",
                "description": "The network zone or LAN segment.",
                "requirement": "Optional"
            }
        ]
    },
    {
        "name": "Uniform Resource Locator",
        "fields": [
            {
                "name": "hostname",
                "data_type": "Hostname",
                "description": "The URL host as extracted from the URL. For example: www.example.com from www.example.com/download/trouble.",
                "requirement": "Recommended"
            },
            {
                "name": "path",
                "data_type": "String",
                "description": "The URL path as extracted from the URL. For example: /download/trouble from www.example.com/download/trouble.",
                "requirement": "Recommended"
            },
            {
                "name": "port",
                "data_type": "Port",
                "description": "The URL port. For example: 80.",
                "requirement": "Recommended"
            },
            {
                "name": "query_string",
                "data_type": "String",
                "description": "The query portion of the URL. For example: q=bad&sort=date extracted from a URL like http://www.example.com/search?q=bad&sort=date.",
                "requirement": "Recommended"
            },
            {
                "name": "scheme",
                "data_type": "String",
                "description": "The scheme portion of the URL. For example: http, https, ftp, or sftp.",
                "requirement": "Recommended"
            },
            {
                "name": "subdomain",
                "data_type": "String",
                "description": "The subdomain portion of the URL. For example: 'sub' in https://sub.example.com or 'sub2.sub1' in https://sub2.sub1.example.com.",
                "requirement": "Optional"
            },
            {
                "name": "url_string",
                "data_type": "URL String",
                "description": "The URL string. See RFC 1738. For example: http://www.example.com/download/trouble.exe. Note: The URL path should not populate the URL string.",
                "requirement": "Recommended"
            }
        ]
    },
    {
        "name": "User",
        "fields": [
            {
                "name": "name",
                "data_type": "String",
                "description": "The username. For example, janedoe1.",
                "requirement": "Recommended"
            },
            {
                "name": "uid",
                "data_type": "String",
                "description": "The unique user identifier. For example, the Windows user SID, ActiveDirectory DN or AWS user ARN.",
                "requirement": "Recommended"
            }
        ]
    }
]