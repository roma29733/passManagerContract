import {hex} from "../build/passMaster.compiled.json";
import {hex as hexChild} from "../build/passChild.compiled.json";
import {Address, Cell, CellType, Slice, toNano} from "ton-core";
import {Blockchain, SandboxContract, TreasuryContract} from "@ton-community/sandbox";
import {PassManagerMasterContract} from "../wrappers/PassManagerMaster";
import "@ton-community/test-utils";
import {stringToCell} from "ton-core/dist/boc/utils/strings";
import {PassManagerChildContract} from "../wrappers/PassManagerChild";
import {listToCell} from "./utilits";

describe("test tests", () => {
    const codeMint = Cell.fromBoc(Buffer.from(hex, "hex"))[0]
    const codeWallet = Cell.fromBoc(Buffer.from(hexChild, "hex"))[0]
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;

    let masterContract: SandboxContract<PassManagerMasterContract>;

    beforeAll(async () => {
        // initial item, for test
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury("deployer")

        masterContract = blockchain.openContract(
            PassManagerMasterContract.createFromConfig({
                admin_address: deployer.address,
                pass_manager_code: codeWallet,
            }, codeMint)
        )
    })

    it("tests of stable work smart contract", async () => {
        const deployResult = await masterContract.sendDeploy(deployer.getSender(), toNano('1'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: masterContract.address,
            deploy: true,
        });

        const addressDeploer = await masterContract.getData(deployer.address)

        const childContract = blockchain.openContract(
            PassManagerChildContract.createFromAddress(
                addressDeploer
            )
        );

        const mintResult = await masterContract.sendMint(deployer.getSender(), deployer.address, listToCell("{\"passwordList\":[{\"id\":1,\"nameItemPassword\":\"tihs pass\",\"emailOrUserName\":\"roma29734@gmail.com\",\"passwordItem\":\"Sobaken2w8\",\"changeData\":\"10.01.2024\",\"urlSite\":\"gitHub\",\"descriptions\":\"descripta\"},{\"id\":2,\"nameItemPassword\":\"sbbs\",\"emailOrUserName\":\"jdhzhshbs\",\"passwordItem\":\"hshxhzh\",\"changeData\":\"10.01.2024\",\"urlSite\":null,\"descriptions\":null},{\"id\":3,\"nameItemPassword\":\"vk\",\"emailOrUserName\":\"romantyssvintys@gmail.com\",\"passwordItem\":\"DefoltPass777\",\"changeData\":\"10.01.2024\",\"urlSite\":\"urlFrom a pa\",\"descriptions\":\"descripta of the Spotify wrapped up on the floor when you get a i 😄 you get a bit more i 😁 e\"},{\"id\":4,\"nameItemPassword\":\"git lab\",\"emailOrUserName\":\"romahab@gmail.com\",\"passwordItem\":\"sobakanasrala228\",\"changeData\":\"10.01.2024\",\"urlSite\":null,\"descriptions\":\"descridetacia \"},{\"id\":5,\"nameItemPassword\":\"new yitne\",\"emailOrUserName\":\"idjsjd\",\"passwordItem\":\"djdjjxjs\",\"changeData\":\"10.01.2024\",\"urlSite\":\"jdnzjs\",\"descriptions\":\"dkjdns\"}]}\n"), toNano('0.05'), toNano('1'));

        expect(mintResult.transactions).toHaveTransaction({
            from: masterContract.address,
            to: childContract.address,
            deploy: true,
        });

        const result = await childContract.getPassManagerChildData()
        console.log("result", result)

        console.log("------------------")

        const changeResult = await childContract.sendChangeItemTitle(deployer.getSender(), toNano('0.01'), stringToCell("Sami new"))

        expect(changeResult.transactions).toHaveTransaction({
            success: true
        })


        const afterChangeResult = await childContract.getPassManagerChildData()
        console.log("afterChangeResult", afterChangeResult)

    })

    it("test to change admin", async () => {

        const newAdmin = await blockchain.treasury("newAdmin")

        const changeAdminResult = await masterContract.sendChangeAdmin(deployer.getSender(), toNano('0.01'), newAdmin.address)
        expect(changeAdminResult.transactions).toHaveTransaction({
            success: true,
        })

        // After change admin

        const afterChangeAdminResult = await masterContract.sendChangeAdmin(deployer.getSender(), toNano('0.01'), deployer.address)

        expect(afterChangeAdminResult.transactions).toHaveTransaction({
            exitCode: 76,
            success: false
        })

        // Last test to change admin address

        const lastTestChangeAminResult = await masterContract.sendChangeAdmin(newAdmin.getSender(), toNano('0.01'), deployer.address)

        expect(lastTestChangeAminResult.transactions).toHaveTransaction({
            success: true
        })
    })

    it("test to change cod item", async () => {
        const newAdmin = await blockchain.treasury("secondNewAdmin")

        const changeNewAdmin = await masterContract.sendChangePassManagerCod(newAdmin.getSender(), toNano('0.01'), codeWallet)

        expect(changeNewAdmin.transactions).toHaveTransaction({
            exitCode: 76,
            success: false
        })

        const changeFitchAdmin = await masterContract.sendChangePassManagerCod(deployer.getSender(), toNano("0.01"), codeWallet)

        expect(changeFitchAdmin.transactions).toHaveTransaction({
            success: true
        })
    })

    it  ("test to send mint non sender adress", async () => {
        const newUser = await blockchain.treasury("newUser")
        const mintResult = await masterContract.sendMint(deployer.getSender(), newUser.address, listToCell("{\"passwordList\":[{\"id\":1,\"nameItemPassword\":\"tihs pass\",\"emailOrUserName\":\"roma29734@gmail.com\",\"passwordItem\":\"Sobaken2w8\",\"changeData\":\"10.01.2024\",\"urlSite\":\"gitHub\",\"descriptions\":\"descripta\"},{\"id\":2,\"nameItemPassword\":\"sbbs\",\"emailOrUserName\":\"jdhzhshbs\",\"passwordItem\":\"hshxhzh\",\"changeData\":\"10.01.2024\",\"urlSite\":null,\"descriptions\":null},{\"id\":3,\"nameItemPassword\":\"vk\",\"emailOrUserName\":\"romantyssvintys@gmail.com\",\"passwordItem\":\"DefoltPass777\",\"changeData\":\"10.01.2024\",\"urlSite\":\"urlFrom a pa\",\"descriptions\":\"descripta of the Spotify wrapped up on the floor when you get a i 😄 you get a bit more i 😁 e\"},{\"id\":4,\"nameItemPassword\":\"git lab\",\"emailOrUserName\":\"romahab@gmail.com\",\"passwordItem\":\"sobakanasrala228\",\"changeData\":\"10.01.2024\",\"urlSite\":null,\"descriptions\":\"descridetacia \"},{\"id\":5,\"nameItemPassword\":\"new yitne\",\"emailOrUserName\":\"idjsjd\",\"passwordItem\":\"djdjjxjs\",\"changeData\":\"10.01.2024\",\"urlSite\":\"jdnzjs\",\"descriptions\":\"dkjdns\"}]}\n"), toNano('0.05'), toNano('1'));
        expect(mintResult.transactions).toHaveTransaction({
            deploy: false
        })
    })

});
