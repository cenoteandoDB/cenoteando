package org.cenoteando.oai.filters;

import com.lyncode.xoai.dataprovider.data.Filter;
import com.lyncode.xoai.dataprovider.data.ItemIdentifier;
import com.lyncode.xoai.dataprovider.xml.xoaiconfig.parameters.ParameterMap;
import org.cenoteando.oai.model.CenoteandoItem;

/**
 * @author Lyncode Development Team <dspace@lyncode.com>
 */
public abstract class CenoteandoFilter implements Filter {

    /** The configuration from xoai.xml file */
    protected ParameterMap configuration;

    public abstract boolean isShown(CenoteandoItem item);

    public abstract String getQuery();

    @Override
    public boolean isItemShown(ItemIdentifier item) {
        if (item instanceof CenoteandoItem) {
            return isShown((CenoteandoItem) item);
        }
        return false;
    }

    /**
     * @return the configuration map if defined in xoai.xml, otherwise null.
     */
    public ParameterMap getConfiguration() {
        return configuration;
    }

    /**
     * @param configuration
     *            the configuration map to set
     */
    public void setConfiguration(ParameterMap configuration) {
        this.configuration = configuration;
    }
}
