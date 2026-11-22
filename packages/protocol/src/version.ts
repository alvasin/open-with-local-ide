/**
 * Version of the Native Messaging contract.
 *
 * The extension and the native host are delivered separately (browser store vs. local install),
 * so a user can run mismatched builds. Increment this on any change that makes old and new
 * builds unable to talk to each other: a removed/renamed field, a new required field, or changed
 * semantics of an existing action.
 */
export const PROTOCOL_VERSION = 1
