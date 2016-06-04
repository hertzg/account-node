module.exports = profile => {
    return {
        online: false,
        profile: profile,
        overrideProfile: {
            fullName: '',
            email: '',
            phone: '',
        },
    }
}
