import {Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode} from "ton-core";

export class PassChildContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell, data: Cell }
    ) {
    }

    static createFromAddress(address: Address) {
        return new PassChildContract(address);
    }


    async sendChangeItemTitle(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        newTitle: Cell
    ) {

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x5773d1f5, 32).storeUint(0, 64).storeRef(newTitle).endCell()
        })
    }

    async getPassManagerChildData(provider: ContractProvider): Promise<string | bigint> {
        let state = await provider.getState();
        if (state.state.type !== 'active') {
            return 0n;
        }
        let res = await provider.get('get_wallet_data', []);
        return res.stack.readString()
    }


    async getBalance(provider: ContractProvider) {
        const res = await provider.get("get_balance_contract", [])
        return res.stack.readNumber()
    }
}