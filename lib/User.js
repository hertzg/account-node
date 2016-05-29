module.exports = (password, fullName, email, phone, registerTime) => {
    return {
        password: password,
        fullName: fullName,
        email: email,
        phone: phone,
        registerTime: registerTime,
        toStorageObject: () => {
            return {
                password: {
                    key: password.key.toString('base64'),
                    digest: password.digest.toString('base64'),
                },
                fullName: fullName,
                email: email,
                phone: phone,
                registerTime: registerTime,
            }
        },
    }
}