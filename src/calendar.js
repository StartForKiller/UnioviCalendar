function downloadCliked() {
    //Call the background process to create the csv
    chrome.runtime.sendMessage({}, (response) => {
        //Create a tem download reference to download it locally
        var downloadTempButton = document.createElement('a');
        //Insert the csv to href
        downloadTempButton.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(response));
        downloadTempButton.setAttribute('download', 'Calendario.csv');

        downloadTempButton.style.display = 'none';
        document.body.appendChild(downloadTempButton); //Add it to the document

        downloadTempButton.click(); //Click it to start the download

        document.body.removeChild(downloadTempButton); //Remove it from the document
    });
}

{
    var msdDiv = document.getElementsByClassName('fc-right')[0];
    var buttonGroup = msdDiv.getElementsByClassName('fc-button-group')[0];

    
    var downloadButton = document.createElement('button');

    //Set text inside the button
    downloadButton.textContent = 'Descargar';
    downloadButton.type = 'button';

    //Set the default css classes for buttons on this section
    downloadButton.classList.add('ui-button');
    downloadButton.classList.add('ui-state-default');
    downloadButton.classList.add('ui-state-active');
    downloadButton.onclick = downloadCliked;

    //Inject a new download button
    buttonGroup.appendChild(downloadButton);
}