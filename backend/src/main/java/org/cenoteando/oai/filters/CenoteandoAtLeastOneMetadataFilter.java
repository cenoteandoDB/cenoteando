package org.cenoteando.oai.filters;

import java.util.ArrayList;
import java.util.List;
import org.cenoteando.oai.model.CenoteandoItem;

public class CenoteandoAtLeastOneMetadataFilter extends CenoteandoFilter {

    private String field;
    private CenoteandoMetadataFilterOperator operator =
        CenoteandoMetadataFilterOperator.UNDEF;
    private List<String> values;

    private String getField() {
        if (field == null) {
            field = getConfiguration().get("field").asSimpleType().asString();
        }
        return field;
    }

    public String getSchema() {
        if (
            getConfiguration() != null &&
            getConfiguration().get("schema") != null
        ) {
            return getConfiguration().get("schema").asSimpleType().asString();
        }
        return "metadata";
    }

    private List<String> getValues() {
        return new ArrayList<>();
        /* TODO: Implement this
        if (values == null) {
            ParameterValue parameterValue = getConfiguration().get("value");
            if (parameterValue == null) parameterValue = getConfiguration().get("values");

            if (parameterValue instanceof SimpleType) {
                values = new ArrayList<>();
                values.add(((SimpleType) parameterValue).asString());
            } else if (parameterValue instanceof ParameterList) {
                values = new ListBuilder<ParameterValue>()
                        .add(parameterValue.asParameterList().getValues())
                        .build(new Function<ParameterValue, String>() {
                            @Override
                            public String apply(ParameterValue elem) {
                                return elem.asSimpleType().asString();
                            }
                        });
            } else values = new ArrayList<String>();
        }
        return values;
        */
    }

    private CenoteandoMetadataFilterOperator getOperator() {
        if (operator == CenoteandoMetadataFilterOperator.UNDEF) operator =
            CenoteandoMetadataFilterOperator.valueOf(
                getConfiguration()
                    .get("operator")
                    .asSimpleType()
                    .asString()
                    .toUpperCase()
            );
        return operator;
    }

    @Override
    public boolean isShown(CenoteandoItem item) {
        return true;
        /* TODO: Implement this
        if (this.getField() == null)
            return true;
        List<String> values = item.getMetadata(this.getField());
        for (String practicalValue : values) {
            for (String theoreticValue : this.getValues()) {
                switch (this.getOperator()) {
                    case STARTS_WITH:
                        if (practicalValue.startsWith(theoreticValue))
                            return true;
                        break;
                    case ENDS_WITH:
                        if (practicalValue.endsWith(theoreticValue))
                            return true;
                        break;
                    case EQUAL:
                        if (practicalValue.equals(theoreticValue))
                            return true;
                        break;
                    case GREATER:
                        if (practicalValue.compareTo(theoreticValue) > 0)
                            return true;
                        break;
                    case GREATER_OR_EQUAL:
                        if (practicalValue.compareTo(theoreticValue) >= 0)
                            return true;
                        break;
                    case LOWER:
                        if (practicalValue.compareTo(theoreticValue) < 0)
                            return true;
                        break;
                    case LOWER_OR_EQUAL:
                        if (practicalValue.compareTo(theoreticValue) <= 0)
                            return true;
                        break;
                    case CONTAINS:
                    default:
                        if (practicalValue.contains(theoreticValue))
                            return true;
                        break;
                }
            }
        }
        return false;
        */
    }

    @Override
    public String getQuery() {
        List<String> parts = new ArrayList<>();
        for (String value : values) buildQuery(field, value, parts);
        return "(" + String.join(") AND (", parts) + ")";
    }

    private void buildQuery(String field, String value, List<String> parts) {
        switch (this.getOperator()) {
            case ENDS_WITH -> parts.add(
                "LIKE(" + field + ", '%" + value + "')"
            );
            case STARTS_WITH -> parts.add(
                "STARTS_WITH(" + field + ", '" + value + "')"
            );
            case EQUAL -> parts.add("(" + field + " == " + value + ")");
            case GREATER -> parts.add("(" + field + " > " + value + ")");
            case LOWER -> parts.add("(" + field + " < " + value + ")");
            case LOWER_OR_EQUAL -> parts.add(
                "(" + field + " <= " + value + ")"
            );
            case GREATER_OR_EQUAL -> parts.add(
                "(" + field + " >= " + value + ")"
            );
            default -> parts.add("CONTAINS(" + field + ", '" + value + "')");
        }
    }
}
