import os
import json
import time
from dotenv import load_dotenv
from web3 import Web3

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, "..", ".env"))

# Cache web3 instance and contract
_w3 = None
_contract = None

def get_web3_and_contract():
    global _w3, _contract
    if _w3 is not None and _contract is not None:
        return _w3, _contract

    rpc_url = os.getenv("POLYGON_RPC_URL")
    contract_address = os.getenv("CONTRACT_ADDRESS")

    if not rpc_url or not contract_address:
        # Gracefully handle missing configuration for compilation or test phases
        raise ValueError(
            "POLYGON_RPC_URL or CONTRACT_ADDRESS is not set in backend/.env"
        )

    # Initialize Web3
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        raise ConnectionError(f"Failed to connect to RPC at {rpc_url}")

    # Load contract ABI
    artifact_path = os.path.join(_HERE, "abi", "CertificateRegistry.json")
    if not os.path.exists(artifact_path):
        raise FileNotFoundError(f"ABI file not found at {artifact_path}. Run compile.py first.")

    with open(artifact_path, "r", encoding="utf-8") as f:
        artifact = json.load(f)

    abi = artifact["abi"]
    checksum_address = w3.to_checksum_address(contract_address)
    contract = w3.eth.contract(address=checksum_address, abi=abi)

    _w3 = w3
    _contract = contract
    return _w3, _contract

def register_certificate_on_blockchain(
    certificate_id: str,
    cert_hash: str,
    student_name: str,
    skill: str,
    issued_at: int
) -> str:
    """Registers a certificate hash on the Polygon smart contract.
    
    Returns the transaction hash (str).
    """
    w3, contract = get_web3_and_contract()
    
    private_key = os.getenv("CONTRACT_DEPLOYER_PRIVATE_KEY") or os.getenv("PRIVATE_KEY")
    if not private_key:
        raise ValueError("CONTRACT_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY is not set in backend/.env")

    account = w3.eth.account.from_key(private_key)
    nonce = w3.eth.get_transaction_count(account.address)

    # Prepare transaction
    tx_params = {
        "chainId": w3.eth.chain_id,
        "from": account.address,
        "nonce": nonce,
        "gasPrice": int(w3.eth.gas_price * 1.2) # 20% gas price buffer
    }

    # Build function call
    txn = contract.functions.registerCertificate(
        certificate_id,
        cert_hash,
        student_name,
        skill,
        issued_at
    ).build_transaction(tx_params)

    # Sign and send
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

    # Return hash hex
    return tx_hash.hex()

def verify_certificate_on_blockchain(certificate_id: str) -> dict:
    """Queries the smart contract to check if a certificate is valid.
    
    Returns:
        dict: {
            "valid": bool,
            "cert_hash": str,
            "student_name": str,
            "skill": str,
            "issued_at": int
        }
    """
    try:
        w3, contract = get_web3_and_contract()
        # Call getCertificate view
        cert_data = contract.functions.getCertificate(certificate_id).call()
        
        return {
            "cert_hash": cert_data[0],
            "student_name": cert_data[1],
            "skill": cert_data[2],
            "issued_at": cert_data[3],
            "valid": cert_data[4]
        }
    except Exception as e:
        print(f"Blockchain verification error for {certificate_id}: {e}")
        return {
            "cert_hash": "",
            "student_name": "",
            "skill": "",
            "issued_at": 0,
            "valid": False
        }
