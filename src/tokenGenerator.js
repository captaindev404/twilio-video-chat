/**
This code should be only hosted by your backend api
 */
import {jwt} from 'twilio'

const AccessToken = jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

export function tokenGenerator(identity, room) {
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
  );

  // Assign identity to the token
  token.identity = identity

  // Grant the access token
  const grant = new VideoGrant()
  grant.room = room
  token.addGrant(grant)

  // Serialize the token to JWT string
  return token.toJwt()
}

