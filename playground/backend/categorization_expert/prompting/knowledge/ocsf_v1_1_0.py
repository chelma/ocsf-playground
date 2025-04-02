OCSF_GUIDANCE = """

"""

# This JSON blob was created with some prompt engineering and manually pasting portions of the OCSF documentation into
# a GenAI prompt.
# 
# See: https://schema.ocsf.io/1.1.0/
# See: https://chatgpt.com/share/67ed81bd-4c64-8001-8824-6084c99a76fe
OCSF_KNOWLEDGE = """
[
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
"""