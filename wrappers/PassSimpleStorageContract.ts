import {Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode} from "ton-core";


export type PassSimpleStorageConfig = {
    namePass: Cell;
    emailPass: Cell;
    itemPass: Cell;
};

export function passSimpleStorageToCell(config: PassSimpleStorageConfig): Cell {
    return beginCell().storeRef(config.namePass).storeRef(config.emailPass).storeRef(config.itemPass).storeUint(0, 2).endCell();
}

export class MainContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell, data: Cell }
    ){}

    static createFromConfig(config: PassSimpleStorageConfig, code: Cell, workchain = 0){
        const data = passSimpleStorageToCell(config);
        const init = { code,data };
        const address = contractAddress(workchain, init);

        return new MainContract(address,init);
    }

    async sendTaskToChangePassItem(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        queryId: bigint,
        newItemPass: Cell
    ) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeUint(queryId, 64).storeRef(newItemPass).endCell()
        })
    }

    async getData(provider: ContractProvider) {
        const {stack} = await provider.get("get_pass_item", []);
        return {
            namePass: stack.readString(),
            emailPass: stack.readString(),
            itemPass: stack.readString()
        }
    }
}