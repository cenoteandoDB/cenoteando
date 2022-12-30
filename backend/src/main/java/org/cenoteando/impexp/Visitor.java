package org.cenoteando.impexp;

import org.cenoteando.models.*;

public interface Visitor {

    void visit(User user);

    void visit(Cenote cenote);

    void visit(Species species);

    void visit(Variable variable);

    void visit(Reference reference);
}
