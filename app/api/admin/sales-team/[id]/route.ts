import { NextResponse } from 'next/server';

export async function PATCH() {
  return NextResponse.json(
    { error: 'Sales team members must be managed from the Employees section' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Sales team members must be managed from the Employees section' },
    { status: 405 }
  );
}
