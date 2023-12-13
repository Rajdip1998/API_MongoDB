Creating a full multisignature wallet contract involves more code than can be presented in a single response. However, I can provide you with a simplified example using Solidity, the programming language for Ethereum smart contracts.

Assuming a simple 2-of-3 multisig wallet, here's a basic example:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiSigWallet {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        mapping(address => bool) isConfirmed;
        uint numConfirmations;
    }

    Transaction[] public transactions;

    event Deposit(address indexed sender, uint value, address indexed to);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint transactionId) {
        require(!transactions[transactionId].isConfirmed[msg.sender], "Transaction already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(_numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length, "Invalid number of confirmations");

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this));
    }

    function submitTransaction(address to, uint value, bytes memory data)
        public
        onlyOwner
    {
        uint transactionId = transactions.length;

        transactions.push(Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            numConfirmations: 0
        }));

        emit Deposit(msg.sender, value, to);
        emitSubmission(transactionId, to, value, data);
    }

    function confirmTransaction(uint transactionId)
        public
        onlyOwner
        notExecuted(transactionId)
        notConfirmed(transactionId)
    {
        Transaction storage transaction = transactions[transactionId];
        transaction.isConfirmed[msg.sender] = true;
        transaction.numConfirmations++;

        emitConfirmation(transactionId, msg.sender);

        if (transaction.numConfirmations >= numConfirmationsRequired) {
            executeTransaction(transactionId);
        }
    }

    function executeTransaction(uint transactionId) public onlyOwner notExecuted(transactionId) {
        Transaction storage transaction = transactions[transactionId];

        require(transaction.numConfirmations >= numConfirmationsRequired, "Not enough confirmations");

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction execution failed");

        emitExecution(transactionId);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint transactionId) public view returns (
        address to,
        uint value,
        bytes memory data,
        bool executed,
        uint numConfirmations
    ) {
        Transaction storage transaction = transactions[transactionId];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }

    event Submission(uint indexed transactionId, address indexed to, uint value, bytes data);
    event Confirmation(uint indexed transactionId, address indexed owner);
    event Execution(uint indexed transactionId);
    
    function emitSubmission(uint transactionId, address to, uint value, bytes memory data) internal {
        emit Submission(transactionId, to, value, data);
    }

    function emitConfirmation(uint transactionId, address owner) internal {
        emit Confirmation(transactionId, owner);
    }

    function emitExecution(uint transactionId) internal {
        emit Execution(transactionId);
    }
}
```

This is a basic example, and in a real-world scenario, you might want to include additional security measures, error handling, and thorough testing before deploying it on the Ethereum network. Also, consider using established libraries or frameworks like OpenZeppelin for production contracts.
