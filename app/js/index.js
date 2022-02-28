$(document).ready(function () {
    ShoutoutContract.detectNetwork();

    $("#shoutout-form").submit(function (e) {
        e.preventDefault();

        ShoutoutContract.deployed().then(function (instance) {
            var metadata = {
                "name": "shoutouts.eth",
                "from": $("#from").val(),
                "to": $("#receipient").val(),
                "message": $("#message").val(),
                "image": "https://ipfs.io/ipfs/QmRGhvqTPvx8kgMSLFdPaCysKvhtP5GV5MsKDmTx3v2QxT",
            };   
            
            ShoutoutContract.awardItem(receipient, "URL_TO_IFPS_METADATA_JSON")
        })
    })
})