class ContractError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ContractError';
    }
}
module.exports=ContractError;