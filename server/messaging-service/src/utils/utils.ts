import { Pool, PoolClient } from 'pg'
import logging from '../config/logging'
import { connect, query } from '../config/postgresql'
import jwt from 'jsonwebtoken';


const CreateToken = (): string => {
    const secretExt = new Date().getTime().toString()

    const jwtSecretKey = `${process.env.ACCOUNT_SECRET}` + secretExt

    const userprivateToken = jwt.sign({}, jwtSecretKey)

    return userprivateToken
}

const checkForPermissions = async (connection: PoolClient, projectToken: string, userSessionToken: string, resource: string, action: string): Promise<boolean> => {
    try {
        const userPrivateToken = await getUserPrivateTokenFromSessionToken(connection!, userSessionToken)
        if (!userPrivateToken || !projectToken) {
            return false
        }

        const permissionQuery = `
                WITH user_roles AS (
                    SELECT DISTINCT r.id, r.level, r.name
                    FROM projects_team_members ptm
                    JOIN roles r ON r.id = ptm.roleid
                    WHERE ptm.userprivatetoken = $1
                    AND ptm.projecttoken = $2
                    ORDER BY r.level DESC
                    LIMIT 1
                ),
                required_permission AS (
                    SELECT MIN(r.level) as min_required_level
                    FROM roles r
                    JOIN role_permissions rp ON rp.roleid = r.id
                    JOIN permissions p ON p.id = rp.permissionid
                    JOIN resources res ON res.id = p.resourceid
                    JOIN actions a ON a.id = p.actionid
                    WHERE res.name = $3
                    AND a.name = $4
                )
                SELECT 
                    CASE 
                        WHEN ur.level >= COALESCE(rp.min_required_level, 0) THEN true
                        WHEN ur.name = 'PROJECT_OWNER' THEN true
                        ELSE false
                    END as has_permission,
                    ur.level as user_level,
                    rp.min_required_level,
                    ur.name as role_name
                FROM user_roles ur
                CROSS JOIN required_permission rp;
            `

        const result = await query(connection!, permissionQuery, [userPrivateToken, projectToken, resource, action])
        console.log(result)
        if (!result || result[0].has_permission === false || result.length === 0) {
            connection?.release()
            return false
        }

        return true
    } catch (error: any) {
        logging.error('CHECK_FOR_PERMISSIONS', error.message)
        return false
    }
}

/**
 * Retrieves the user's private token from their public token.
 *
 * @param {PoolClient} connection - The database connection pool.
 * @param {string} sessionToken - The user's public token.
 * @return {string | null} The user's private token, or `null` if not found or an error occurred.
 */
const getUserPrivateTokenFromSessionToken = async (connection: PoolClient, sessionToken: string): Promise<string | null> => {
    const NAMESPACE = 'GET_USER_PRIVATE_TOKEN_FUNC'

    if (!sessionToken || sessionToken === 'undefined') {
        return null
    }

    if (!connection) {
        return null
    }

    const queryString = `
        SELECT u.UserPrivateToken
        FROM account_sessions s
        INNER JOIN users u ON s.userID = u.id
        WHERE s.userSessionToken = $1
        LIMIT 1;
    `

    try {
        const result = await query(connection, queryString, [sessionToken])
        if (result.length > 0) {
            return result[0].userprivatetoken
        } else {
            return null
        }
    } catch (error: any) {
        connection?.release()
        logging.error(NAMESPACE, error.message, error)
        return null
    }
}

const getUserPublicTokenFromPrivateToken = async (connection: PoolClient, userPrivateToken: string): Promise<string | null> => {
    const NAMESPACE = 'GET_USER_PRIVATE_TOKEN_FUNC'
    const QueryString = `SELECT UserPublicToken FROM users WHERE UserPrivateToken='${userPrivateToken}';`

    try {
        if (userPrivateToken === 'undefined') {
            connection.release()

            return null
        }

        if (connection == null) {
            return null
        }

        const resp = await query(connection, QueryString)
        if (Object.keys(resp).length != 0) {
            return resp[0].userpublictoken
        } else {
            return null
        }
    } catch (error: any) {
        connection?.release()
        logging.error(NAMESPACE, error.message, error)
        return null
    }
}

const getUserPublicTokenFromSessionToken = async (connection: PoolClient, sessionToken: string): Promise<string | null> => {
    const NAMESPACE = 'GET_USER_PUBLIC_TOKEN_FUNC'

    try {
        if (!sessionToken || sessionToken === 'undefined' || !connection) {
            return null
        }

        const queryString = `
            SELECT u.UserPublicToken
            FROM account_sessions s
            INNER JOIN users u ON s.userID = u.id
            WHERE s.userSessionToken = $1
            LIMIT 1;
        `

        const resp = await query(connection, queryString, [sessionToken])

        if (resp.length > 0) {
            return resp[0].userpublictoken
        }

        return null
    } catch (error: any) {
        connection?.release()
        logging.error(NAMESPACE, error.message, error)
        return null
    }
}


const getUserPrivateTokenFromPublicToken = async (connection: PoolClient, userToken: string): Promise<string | null> => {
    const NAMESPACE = 'GET_USER_PRIVATE_TOKEN_FUNC'
    const QueryString = `SELECT UserPrivateToken FROM users WHERE UserPublicToken='${userToken}';`
    try {
        if (userToken === 'undefined') {
            return null
        }

        if (connection == null) {
            return null
        }
        const resp = await query(connection, QueryString)
        if (Object.keys(resp).length != 0) {
            return resp[0].userprivatetoken
        } else {
            return null
        }
    } catch (error: any) {
        connection?.release()
        logging.error(NAMESPACE, error.message, error)
        return null
    }
    return null
}

export { CreateToken, checkForPermissions, getUserPrivateTokenFromSessionToken, getUserPublicTokenFromPrivateToken, getUserPublicTokenFromSessionToken, getUserPrivateTokenFromPublicToken }
