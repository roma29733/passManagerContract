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

export type PassManagerMasterStorageConfig = {
    admin_address: Address;
    pass_manager_code: Cell;
};

export function passManagerMasterStorageToCell(config: PassManagerMasterStorageConfig): Cell {
    return beginCell().storeAddress(config.admin_address).storeRef(config.pass_manager_code).endCell();
}

export class PassManagerMasterContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell, data: Cell }
    ) {
    }

    static createFromConfig(config: PassManagerMasterStorageConfig, code: Cell, workchain = 0) {
        const data = passManagerMasterStorageToCell(config);
        const init = {code, data};
        const address = contractAddress(workchain, init);

        return new PassManagerMasterContract(address, init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell()
        });
    }

    static mintMessage(to: Address, jetton_amount: Cell, forward_ton_amount: bigint, total_ton_amount: bigint,) {
        return beginCell().storeUint(0x1674b0a0, 32).storeUint(0, 64) // op, queryId
            .storeAddress(to).storeRef(jetton_amount)
            .storeCoins(forward_ton_amount).storeCoins(total_ton_amount)
            .endCell();
    }
    async sendMint(provider: ContractProvider, via: Sender, to: Address, jetton_amount: Cell, forward_ton_amount: bigint, total_ton_amount: bigint) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: PassManagerMasterContract.mintMessage(to, jetton_amount, forward_ton_amount, total_ton_amount),
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

    async sendChangePassManagerCod(provider: ContractProvider, via: Sender, value: bigint, pass_manager_code: Cell) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x5773d1f5,32).storeUint(0, 64).storeRef(pass_manager_code).endCell(),
            value: value
        })
    }

    async getData(provider: ContractProvider, owner: Address) {
        const res = await provider.get('get_address_pass', [{ type: 'slice', cell: beginCell().storeAddress(owner).endCell() }])
        return res.stack.readAddress()
    }
}