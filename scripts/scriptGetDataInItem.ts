import {PassManagerChildContract} from "../wrappers/PassManagerChild";
import {Address} from "ton-core";

async function getDataInitem() {


    const contractChild = PassManagerChildContract.createFromAddress(Address.parse("EQAtIM6sQUISwWOaS6iB31w6qQCmJ9fQ5sTjsfomKQqmA-EW"))

    // @ts-ignore
    const resultRequest = await contractChild.getPassManagerChildData()

    console.log("resultRequest", resultRequest)
}

getDataInitem()