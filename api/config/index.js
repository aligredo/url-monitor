module.exports = {
    SECRET: process.env.SECRET || "AE608F91F8A740ECFA9DF0CACBF549D85200B9AC1C9E86FBEA60C3FECB9D22AF",
    EMAIL_HOST:  process.env.EMAIL_HOST || 'smtp.sendgrid.net',
    SENDER_EMAIL:  process.env.SENDER_EMAIL || 'url.monitor.api@gmail.com',
    EMAIL_PORT:  process.env.EMAIL_PORT || 587,
    SENDGRID_USERNAME:  process.env.SENDGRID_USERNAME || "apikey",
    SENDGRID_PASSWORD:  process.env.SENDGRID_PASSWORD || "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",
	MONGO_URI:  process.env.MONGO_URI || "mongodb://localhost:27017/url-monitor",
    EMAIL_REGEX: RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    URL_REGEX: RegExp(/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i)
};