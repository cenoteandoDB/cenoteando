package org.cenoteando.impexp;

public abstract class DomainEntity {
    public abstract void accept(Visitor visitor);
    public abstract boolean validate();
}
