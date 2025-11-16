#!/usr/bin/env node
/**
 * Script: check_and_migrate_roles.js
 * Purpose: Connects to MongoDB, reports documents with non-canonical role values
 * and optionally migrates known legacy role names to canonical ones.
 *
 * Usage:
 *  # dry-run (report only)
 *  $env:MONGO_URI="mongodb://..."; node .\scripts\check_and_migrate_roles.js
 *
 *  # migrate known legacy values (destructive)
 *  $env:MONGO_URI="mongodb://..."; node .\scripts\check_and_migrate_roles.js --migrate
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { USER_ROLES, MEMBER_ROLES, ROLES } from '../src/constants/roles.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Please set MONGO_URI in your environment before running this script.');
  process.exit(1);
}

// import models after mongoose connect path is set
import('../src/models/user.models.js');
import('../src/models/projectMember.models.js');

const User = mongoose.model('User');
const ProjectMember = mongoose.model('ProjectMember');

const legacyToCanonical = {
  // common legacy variants -> canonical
  project_head: ROLES.LEADER,
  ProjectLeader: ROLES.LEADER,
  Projectleader: ROLES.LEADER,
  projectHead: ROLES.LEADER,
  PROJECT_LEAD: ROLES.LEADER,
};

const args = process.argv.slice(2);
const doMigrate = args.includes('--migrate');

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  // Users with non-canonical roles
  const invalidUserRoles = await User.find({ role: { $nin: USER_ROLES } }).lean().limit(50).exec();
  const invalidUserCount = await User.countDocuments({ role: { $nin: USER_ROLES } });
  console.log(`Users with non-canonical roles: ${invalidUserCount}`);
  if (invalidUserCount > 0) console.table(invalidUserRoles.map(u => ({ _id: u._id.toString(), email: u.email, role: u.role })));

  // ProjectMembers with non-canonical roles
  const invalidMemberRoles = await ProjectMember.find({ role: { $nin: MEMBER_ROLES } }).lean().limit(50).exec();
  const invalidMemberCount = await ProjectMember.countDocuments({ role: { $nin: MEMBER_ROLES } });
  console.log(`ProjectMembers with non-canonical roles: ${invalidMemberCount}`);
  if (invalidMemberCount > 0) console.table(invalidMemberRoles.map(m => ({ _id: m._id.toString(), project: String(m.project), user: String(m.user), role: m.role })));

  if (doMigrate) {
    console.log('\nMigrating known legacy role values...');
    // Users
    for (const [legacy, canonical] of Object.entries(legacyToCanonical)) {
      const res = await User.updateMany({ role: legacy }, { $set: { role: canonical } });
      if (res.modifiedCount > 0) console.log(`Updated ${res.modifiedCount} User(s) from '${legacy}' -> '${canonical}'`);
    }

    // ProjectMembers
    for (const [legacy, canonical] of Object.entries(legacyToCanonical)) {
      const res = await ProjectMember.updateMany({ role: legacy }, { $set: { role: canonical } });
      if (res.modifiedCount > 0) console.log(`Updated ${res.modifiedCount} ProjectMember(s) from '${legacy}' -> '${canonical}'`);
    }

    console.log('Migration complete. Re-checking for remaining non-canonical roles...');
    const remainingUsers = await User.countDocuments({ role: { $nin: USER_ROLES } });
    const remainingMembers = await ProjectMember.countDocuments({ role: { $nin: MEMBER_ROLES } });
    console.log(`Remaining non-canonical Users: ${remainingUsers}`);
    console.log(`Remaining non-canonical ProjectMembers: ${remainingMembers}`);
  } else {
    console.log('\nDry-run complete. No changes made. To migrate known legacy values run with --migrate');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(2);
});
