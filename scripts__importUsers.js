const mongoose = require("mongoose");
const crypto = require("crypto");

const userModel = require("../schemas/users");
const roleModel = require("../schemas/roles");
const { sendAccountPasswordMail } = require("../utils/senMailHandler");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/NNPTUD-C6";

function generatePassword(length = 16) {
    // Avoid ambiguous characters to make password easier to read from email.
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        result += chars[randomIndex];
    }
    return result;
}

async function run() {
    await mongoose.connect(MONGO_URI);

    let userRole = await roleModel.findOne({ name: "user", isDeleted: false });
    if (!userRole) {
        userRole = await roleModel.create({
            name: "user",
            description: "Default user role"
        });
    }

    const summary = {
        created: 0,
        skipped: 0,
        mailSent: 0,
        mailFailed: 0,
        errors: []
    };

    for (let i = 1; i <= 99; i++) {
        const index = String(i).padStart(2, "0");
        const username = `user${index}`;
        const email = `${username}@haha.com`;

        try {
            const existed = await userModel.findOne({
                $or: [{ username }, { email }],
                isDeleted: false
            });

            if (existed) {
                summary.skipped++;
                continue;
            }

            const plainPassword = generatePassword(16);

            const newUser = new userModel({
                username,
                email,
                password: plainPassword,
                role: userRole._id,
                status: true
            });

            await newUser.save();
            summary.created++;

            try {
                await sendAccountPasswordMail(email, username, plainPassword);
                summary.mailSent++;
            } catch (mailError) {
                summary.mailFailed++;
                summary.errors.push(`Mail loi ${email}: ${mailError.message}`);
            }
        } catch (error) {
            summary.errors.push(`User ${username} loi: ${error.message}`);
        }
    }

    console.log("=== Import users done ===");
    console.log(summary);
}

run()
    .catch((error) => {
        console.error("Import that bai:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
