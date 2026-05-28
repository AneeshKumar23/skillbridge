import os
import json
import sys
from dotenv import load_dotenv
from web3 import Web3

# Load env variables
_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, "..", ".env"))

def main():
    rpc_url = os.getenv("POLYGON_RPC_URL")
    private_key = os.getenv("CONTRACT_DEPLOYER_PRIVATE_KEY") or os.getenv("PRIVATE_KEY")

    if not rpc_url:
        print("Error: POLYGON_RPC_URL environment variable is not set in .env")
        sys.exit(1)
    if not private_key:
        print("Error: PRIVATE_KEY environment variable is not set in .env")
        sys.exit(1)

    # Initialize Web3
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        print(f"Error: Failed to connect to RPC URL: {rpc_url}")
        sys.exit(1)

    print(f"Connected to chain ID: {w3.eth.chain_id}")

    # Load account
    account = w3.eth.account.from_key(private_key)
    print(f"Deployer Address: {account.address}")
    balance = w3.eth.get_balance(account.address)
    print(f"Balance: {w3.from_wei(balance, 'ether')} POL/MATIC")

    # Load ABI and bytecode
    artifact_path = os.path.join(_HERE, "abi", "CertificateRegistry.json")
    if not os.path.exists(artifact_path):
        print(f"Error: Contract artifact not found at {artifact_path}. Run compile.py first.")
        sys.exit(1)

    with open(artifact_path, "r", encoding="utf-8") as f:
        artifact = json.load(f)

    abi = artifact["abi"]
    bytecode = artifact["bytecode"]

    # Deploy contract
    print("Deploying CertificateRegistry...")
    CertificateRegistry = w3.eth.contract(abi=abi, bytecode=bytecode)

    # Build transaction
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Estimate gas limits
    tx_params = {
        "chainId": w3.eth.chain_id,
        "from": account.address,
        "nonce": nonce,
        "gasPrice": int(w3.eth.gas_price * 1.2) # 20% buffer
    }
    
    # Build deploy transaction
    construct_txn = CertificateRegistry.constructor().build_transaction(tx_params)

    # Sign transaction
    signed_txn = w3.eth.account.sign_transaction(construct_txn, private_key=private_key)

    # Send transaction
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    print(f"Deployment transaction sent. Hash: {tx_hash.hex()}")
    print("Waiting for transaction receipt...")
    
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
    contract_address = tx_receipt.contractAddress
    
    print(f"Contract successfully deployed to: {contract_address}")
    print(f"Block Number: {tx_receipt.blockNumber}")
    print(f"Please update your .env with: CONTRACT_ADDRESS={contract_address}")

if __name__ == "__main__":
    main()
