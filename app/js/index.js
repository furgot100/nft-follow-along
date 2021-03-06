import Web3 from "web3";
import shoutoutArtifact from "../../build/contracts/ShoutoutContract.json";
import fleek from '@fleekhq/fleek-storage-js';



// Create a Javascript class to keep track of all the things
// we can do with our contract.
// Credit: https://github.com/truffle-box/webpack-box/blob/master/app/src/index.js
const App = {
    web3: null,
    account: null,
    shoutoutContract: null,

    start: async function () {
        // Connect to Web3 instance.
        const { web3 } = this;

        try {
            // Get contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = shoutoutArtifact.networks[networkId];
            this.shoutoutContract = new web3.eth.Contract(
                shoutoutArtifact.abi,
                deployedNetwork.address,
            );

            // Get accounts and refresh the balance.
            const accounts = await web3.eth.getAccounts();
            this.account = accounts[0];
            this.refreshBalance();
        } catch (error) {
            console.error("Could not connect to contract or chain: ", error);
        }
    },

    refreshBalance: async function () {
        // Fetch the balanceOf method from our contract.
        const { balanceOf } = this.shoutoutContract.methods;

        // Fetch shoutout amount by calling balanceOf in our contract.
        const balance = await balanceOf(this.account).call();

        // Update the page using jQuery.
        $('#balance').html(balance);
        $('#total-shouts').show();
        $('my-account').html(this.account);
    },

    storeMetadata: async function (name, to, message) {
        // Build the metadata.
        var metadata = {
            "name": "shoutouts.eth",
            "description": `Shoutout from ${name}`,
            "to": to,
            "message": message,
            "timestamp": new Date().toISOString()
        };

        // Configure the uploader.
        const uploadMetadata = {
            apiKey: 'ppb6Voy3uLv5OInt6vF2vg==',
            apiSecret: '5kQee6tAKemqskzcUw4v+ix1+aSRzoBtSQukecdTwf4=',
            key: `metadata/${metadata.timestamp}.json`,
            data: JSON.stringify(metadata),
        };

        // Tell the user we're sending the shoutout.
        this.setStatus("Sending shoutout... please wait!");

        // Add the metadata to IPFS first, because our contract requires a
        // valid URL for the metadata address.
        const result = await fleek.upload(uploadMetadata);

        // Once the file is added, then we can send a shoutout!
        this.awardItem(to, result.publicUrl);
    },

    awardItem: async function (to, metadataURL) {
        // Fetch the awardItem method from our contract.
        const { awardItem } = this.shoutoutContract.methods;

        // Award the shoutout.
        await awardItem(to, metadataURL).send({ from: this.account });

        // Set the status and show the metadata link on IPFS.
        this.setStatus(`Shoutout sent! View the metadata <a href="${metadataURL}" target="_blank">here</a>.`);

        // Finally, refresh the balance (in the case where we send a shoutout to ourselves!)
        this.refreshBalance();
    },

    setStatus: function (message) {
        $('#status').html(message);
    }
};

window.App = App;


// When all the HTML is loaded, run the code in the callback below.
$(document).ready(function () {
    // Detect Web3 provider.
    if (window.ethereum) {
        // use MetaMask's provider
        App.web3 = new Web3(window.ethereum);
        window.ethereum.enable(); // get permission to access accounts
    } else {
        console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",);
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        App.web3 = new Web3(
            new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
        );
    }
    // Initialize Web3 connection.
    window.App.start();

    // Capture the form submission event when it occurs.
    $("#shoutout-form").submit(function (e) {
        // Run the code below instead of performing the default form submission action.
        e.preventDefault();

        // Capture form data and create metadata from the submission.
        const name = $("#from").val();
        const to = $("#to").val();
        const message = $("#message").val();

        window.App.storeMetadata(name, to, message);
    });
});