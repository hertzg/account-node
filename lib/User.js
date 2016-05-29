module.exports = (password, registerTime) => {
    return {
        password: password,
        registerTime: registerTime,
        toStorageObject: () => {
            return {
                password: {
                    key: password.key.toString('base64'),
                    digest: password.digest.toString('base64'),
                },
                registerTime: registerTime,
            }
        },
    }
}
