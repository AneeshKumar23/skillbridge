import os
import json
import sys

def main():
    try:
        from solcx import compile_standard, install_solc
    except ImportError:
        print("solcx not installed, attempting to install...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "py-solc-x"])
        from solcx import compile_standard, install_solc

    # Install solc
    print("Installing solc 0.8.20...")
    install_solc("0.8.20")
    
    # Read contract
    contracts_dir = os.path.dirname(os.path.abspath(__file__))
    contract_path = os.path.join(contracts_dir, "contracts", "CertificateRegistry.sol")
    
    with open(contract_path, "r", encoding="utf-8") as f:
        contract_source = f.read()

    # Compile
    print("Compiling contract...")
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {"CertificateRegistry.sol": {"content": contract_source}},
            "settings": {
                "outputSelection": {
                    "*": {
                        "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                    }
                }
            },
        },
        solc_version="0.8.20",
    )

    # Extract ABI and Bytecode
    contract_data = compiled_sol["contracts"]["CertificateRegistry.sol"]["CertificateRegistry"]
    abi = contract_data["abi"]
    bytecode = contract_data["evm"]["bytecode"]["object"]

    # Write to ABI folder
    abi_dir = os.path.join(contracts_dir, "abi")
    os.makedirs(abi_dir, exist_ok=True)
    
    output_path = os.path.join(abi_dir, "CertificateRegistry.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"abi": abi, "bytecode": bytecode}, f, indent=4)
        
    print(f"Compilation successful! Saved to {output_path}")

if __name__ == "__main__":
    main()
