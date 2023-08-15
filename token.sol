// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract SLLToken is ERC1155 {
    constructor() ERC1155("SLL") {}

    struct Offering {
        string name;
        uint256 basic_interest_rate;
    }

    mapping(string => Offering) public Offerings;

    struct BondDetails {
        string offering_id;
        address borrower;
        address lender;
        uint256 total_amount;
        uint256 net_amount;
        uint256 terms;
        uint256 interest;
        uint256 amount;
        uint256 score;
    }

    mapping(uint256 => BondDetails) public SLLBond;

    function createOffering(
        string memory _name,
        uint256 rate,
        string memory id
    ) public {
        Offerings[id] = Offering(_name, rate);
    }

    function createNewBond(
        address _borrower,
        uint256 _amount,
        string memory id,
        uint256 token_id,
        uint256 _terms,
        uint256 term_amount
    ) public {
        Offering memory offeringData = Offerings[id];
        SLLBond[token_id] = BondDetails(
            id,
            _borrower,
            msg.sender,
            _amount,
            _amount,
            _terms,
            offeringData.basic_interest_rate,
            term_amount,
            0
        );
         _mint(msg.sender, token_id, 1, '0x0');
    }

    function bondEvaluation(uint256 token_id, uint256 _score)
        public
        returns (uint256)
    {
        BondDetails memory bondData = SLLBond[token_id];
        bondData.score = _score;
        if (_score == 5) {
            bondData.interest -= 50;
        } else if (_score == 4) {
            bondData.interest -= 25;
        } else if (_score == 2) {
            bondData.interest += 25;
        } else if (_score == 1) {
            bondData.interest += 25;
        }
        SLLBond[token_id] = bondData;
        return bondData.interest;
    }

    function updateBondDetails(
        uint256 token_id,
        uint256 _terms,
        uint256 _amount
    ) public{
        BondDetails memory bondData = SLLBond[token_id];
        bondData.terms = _terms;
        bondData.amount = _amount;
        SLLBond[token_id] = bondData;
    }

    function bondRepayment(uint256 token_id) public {
        BondDetails memory bondData = SLLBond[token_id];
        bondData.terms -= 1;
        bondData.net_amount -= bondData.amount;
        SLLBond[token_id] = bondData;
    }
}