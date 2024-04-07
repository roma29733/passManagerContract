import {Cell, StateInit, beginCell, contractAddress, storeStateInit, toNano, Address} from "ton-core";
import {hex} from "../build/passMasterHex.compiled.json";
import {hex as hexChild} from "../build/passChildHex.compiled.json";
import qs from "qs";
import qrcode from "qrcode-terminal";
import {passManagerMasterStorageToCell} from "../wrappers/PassManagerMaster";


// https://testnet.tonscan.org/address/kQB_A5Y7bLtwbU6U-zuCidzbwIkUSosp9EhlXKE4b11eaDtN
//https://testnet.tonscan.org/address/kQAGk49nsgw3p7tZXlqNr4wUE1PeVPnuiynbRJXZ6jzgom_u
// https://testnet.tonscan.org/address/kQBEuRw4qtBLCepCKw6lRZcIpe5G-7ICSI6K1JCCrIPE_IAa - last
async function deployContract() {
    const codeCell = Cell.fromBoc(Buffer.from(hex,"hex"))[0];
    const codeChild = Cell.fromBoc(Buffer.from(hexChild, "hex"))[0];

    const data = passManagerMasterStorageToCell({
        admin_address: Address.parse("0QDDp_elzjex41uOyzGPNRKy8ysk44-2YxhLj4xg29xJskm1"),
        pass_manager_code: codeChild,
    });

    const stateInit: StateInit = {
        code: codeCell,
        data: data,
    };

    const stateInitBuilder = beginCell();
    storeStateInit(stateInit)(stateInitBuilder);
    const stateInitCell = stateInitBuilder.endCell();

    const address = contractAddress(0, {
        code: codeCell,
        data: data,
    });

    let deployLink =
        'https://app.tonkeeper.com/transfer/' +
        address.toString({
            testOnly: true,
        }) +
        "?" +
        qs.stringify({
            text: "Deploy contract by QR",
            amount: toNano("0.1").toString(10),
            init: stateInitCell.toBoc({idx: false}).toString("base64"),
        });

    qrcode.generate(deployLink, {small: true }, (qr) => {
        console.log(qr);
    });

    let scanAddr =
        'https://tonscan.org/address/' +
        address.toString({
            testOnly: true,
        })

    console.log(scanAddr);
}
deployContract()