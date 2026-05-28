// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    address public owner;
    
    struct Certificate {
        string certHash;      // SHA256 hash of the certificate image
        string studentName;
        string skill;
        uint256 issuedAt;
        bool valid;
    }
    
    mapping(string => Certificate) public certificates; // mapping of certificate_id => Certificate
    
    event CertificateRegistered(string indexed certificateId, string certHash, string studentName, string skill);
    event CertificateRevoked(string indexed certificateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerCertificate(
        string memory certificateId,
        string memory certHash,
        string memory studentName,
        string memory skill,
        uint256 issuedAt
    ) public onlyOwner {
        require(!certificates[certificateId].valid, "Certificate ID already registered");
        certificates[certificateId] = Certificate(certHash, studentName, skill, issuedAt, true);
        emit CertificateRegistered(certificateId, certHash, studentName, skill);
    }

    function revokeCertificate(string memory certificateId) public onlyOwner {
        require(certificates[certificateId].valid, "Certificate not valid or not found");
        certificates[certificateId].valid = false;
        emit CertificateRevoked(certificateId);
    }

    function getCertificate(string memory certificateId) public view returns (
        string memory certHash,
        string memory studentName,
        string memory skill,
        uint256 issuedAt,
        bool valid
    ) {
        Certificate memory cert = certificates[certificateId];
        return (cert.certHash, cert.studentName, cert.skill, cert.issuedAt, cert.valid);
    }
}
