function showSucessNotification(message) {

    new Noty({
        type: 'success',
        layout: 'topRight',
        theme: 'nest',
        text: message,
        timeout: '1500'

    }).show();
}

function showErrorNotification(error) {
    new Noty({
        type: 'error',
        layout: 'topRight',
        theme: 'nest',
        text: error,
        timeout: '1500'

    }).show();
}