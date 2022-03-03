package org.cenoteando.oai.resolvers;

import com.lyncode.xoai.dataprovider.data.Filter;
import com.lyncode.xoai.dataprovider.filter.conditions.AndCondition;
import com.lyncode.xoai.dataprovider.filter.conditions.Condition;
import com.lyncode.xoai.dataprovider.filter.conditions.CustomCondition;
import com.lyncode.xoai.dataprovider.filter.conditions.NotCondition;
import com.lyncode.xoai.dataprovider.filter.conditions.OrCondition;
import com.lyncode.xoai.dataprovider.services.api.FilterResolver;
import com.lyncode.xoai.dataprovider.xml.xoaiconfig.parameters.ParameterMap;
import java.lang.reflect.InvocationTargetException;
import org.cenoteando.oai.filters.AndFilter;
import org.cenoteando.oai.filters.CenoteandoFilter;
import org.cenoteando.oai.filters.NotFilter;
import org.cenoteando.oai.filters.OrFilter;

public class CenoteandoFilterResolver implements FilterResolver {

    public CenoteandoFilter getFilter(Condition condition) {
        if (
            condition instanceof AndCondition
        ) return (CenoteandoFilter) getFilter(
            (AndCondition) condition
        ); else if (
            condition instanceof OrCondition
        ) return (CenoteandoFilter) getFilter(
            (OrCondition) condition
        ); else if (
            condition instanceof NotCondition
        ) return (CenoteandoFilter) getFilter(
            (NotCondition) condition
        ); else if (
            condition instanceof CustomCondition customCondition
        ) return (CenoteandoFilter) customCondition.getFilter(); else return (CenoteandoFilter) condition.getFilter();
    }

    @Override
    public Filter getFilter(
        Class<? extends Filter> filterClass,
        ParameterMap configuration
    ) {
        Filter result = null;
        try {
            result = filterClass.getDeclaredConstructor().newInstance();

            if (result instanceof CenoteandoFilter) {
                ((CenoteandoFilter) result).setConfiguration(configuration);
            }
        } catch (
            InstantiationException
            | IllegalAccessException
            | IllegalArgumentException
            | InvocationTargetException
            | SecurityException
            | NoSuchMethodException e
        ) {
            // TODO: Deal with exceptions
            throw new RuntimeException(e);
        }
        return result;
    }

    @Override
    public Filter getFilter(AndCondition andCondition) {
        CenoteandoFilter leftFilter = this.getFilter(andCondition.getLeft());
        CenoteandoFilter rightFilter = this.getFilter(andCondition.getRight());
        return new AndFilter(leftFilter, rightFilter);
    }

    @Override
    public Filter getFilter(OrCondition orCondition) {
        CenoteandoFilter leftFilter = this.getFilter(orCondition.getLeft());
        CenoteandoFilter rightFilter = this.getFilter(orCondition.getRight());
        return new OrFilter(leftFilter, rightFilter);
    }

    @Override
    public Filter getFilter(NotCondition notCondition) {
        CenoteandoFilter filter = this.getFilter(notCondition.getCondition());
        return new NotFilter(filter);
    }
}
