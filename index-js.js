import {createWalletClient, custom, createPublicClient, parseEther, defineChain} from "https://esm.sh/viem"
import { contractAddress, abi } from "./constants-js.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmountInput = document.getElementById("ethAmount"); 

// console.log(createWalletClient);


let walletClient;
let publicClient;

async function connect() {
    if(typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        })
        await walletClient.requestAddresses();
        connectButton.innerHTML = "Connected"
    } else {
        connectButton.innerHTML = "Please Install MetaMask";
    }

    console.log("Hello");
    
}

async function fund() {
    const ethAmount = ethAmountInput.value
    console.log(`Funding with ${ethAmount}...`);

    if(typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        })
        const [connectedAccount] = await walletClient.requestAddresses(); // [xyz] is short hand of saying first value(in this case address) of the list
        const currentChain = await getCurrentChain(walletClient)

        publicClient = createPublicClient({
            transport: custom(window.ethereum)
        })

        const {request} = await publicClient.simulateContract({
            address: contractAddress,
            abi: abi,
            functionName: "fund",
            account:connectedAccount,
            chain: currentChain,
            value: parseEther(ethAmount),
        })

        console.log("Done Simulating");
        

        const hash = await walletClient.writeContract(request)
        console.log(hash);
                

    } else {
        connectButton.innerHTML = "Please Install MetaMask";
    }    
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  })
  return currentChain
}

connectButton.onclick = connect
fundButton.onclick = fund