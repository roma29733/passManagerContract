import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano
} from "ton-core";

export type PassMasterStorageConfig = {
    admin_address: Address;
    pass_manager_code: Cell;
};

export function passMasterStorageToCell(config: PassMasterStorageConfig): Cell {
    return beginCell().storeAddress(config.admin_address).storeRef(config.pass_manager_code).endCell();
}

export class PassMasterContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell, data: Cell }
    ) {
    }

    static createFromConfig(config: PassMasterStorageConfig, code: Cell, workchain = 0) {
        const data = passMasterStorageToCell(config);
        const init = {code, data};
        const address = contractAddress(workchain, init);

        return new PassMasterContract(address, init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell()
        });
    }

    static mintMessage(to: Address, jetton_amount: Cell, total_ton_amount: bigint,) {
        return beginCell().storeUint(0x1674b0a0, 32).storeUint(0, 64) // op, queryId
            .storeAddress(to).storeRef(jetton_amount).storeCoins(total_ton_amount)
            .endCell();
    }
    async sendMint(provider: ContractProvider, via: Sender, to: Address, jetton_amount: Cell, total_ton_amount: bigint) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: PassMasterContract.mintMessage(to, jetton_amount, total_ton_amount),
            value: total_ton_amount + toNano("0.1"),
        });
    }

    async sendChangeAdmin(provider: ContractProvider, via: Sender, value: bigint, to: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x4840664f,32).storeUint(0, 64).storeAddress(to).endCell(),
            value: value
        })
    }

    async sendToGetFullTon(provider: ContractProvider, via: Sender, value: bigint, requestCoins: bigint) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeUint(0,64).storeCoins(requestCoins).endCell(),
            value: value
        })
    }

    async sendChangePassManagerCod(provider: ContractProvider, via: Sender, value: bigint, pass_manager_code: Cell) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x5773d1f5,32).storeUint(0, 64).storeRef(pass_manager_code).endCell(),
            value: value
        })
    }

    async getBalance(provider: ContractProvider) {
        const res = await provider.get("get_balance_contract", [])
        return res.stack.readNumber()
    }

    async getData(provider: ContractProvider, owner: Address) {
        const res = await provider.get('get_address_pass', [{ type: 'slice', cell: beginCell().storeAddress(owner).endCell() }])
        return res.stack.readAddress()
    }
}