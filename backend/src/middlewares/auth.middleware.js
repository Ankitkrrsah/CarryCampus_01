import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'admin')) {
        return res.status(403).json({ status: "failed", message: "Access Denied: Admins only" });
    }
    next();
};

export const verifyJWT = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ status: "failed", message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_secret");

        req.user = decodedToken;
        next();

    } catch (error) {
        return res.status(401).json({ status: "failed", message: "Invalid Access Token" });
    }
};