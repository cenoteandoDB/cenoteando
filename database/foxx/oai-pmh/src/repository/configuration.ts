/*
 *  Copyright 2018 Willamette University
 *  Modified work Copyright 2021 Cenoteando.org
 *
 *  This file is part of OAI-PHM Service.
 *
 *  @author Michael Spalti
 *
 *  OAI-PHM Service is based on the Modular OAI-PMH Server, University of Helsinki,
 *  The National Library of Finland.
 *
 *  OAI-PHM Service is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  OAI-PHM Service is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with OAI-PHM Service.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
    DELETED_RECORDS_SUPPORT,
    HARVESTING_GRANULARITY,
} from '../core/core-oai-provider';
import { ProviderConfiguration } from '../core/oai-service';

// TODO: Get config from process.env.* (or dynamically where possible)
// Motivation: Apps sometimes store config as constants in the code. This is a violation of twelve-factor, which
// requires strict separation of config from code. Config varies substantially across deploys, code does not. (...)
// In a twelve-factor app, env vars are granular controls, each fully orthogonal to other env vars.

/**
 * module configuration.
 */
export class Configuration implements ProviderConfiguration {
    public repositoryName = 'Cenoteando';
    public baseURL = 'https://cenoteando.org/oai/request';
    public protocolVersion = '2.0';
    public adminEmail = 'cenoteando@gmail.com';
    public port = 0;
    public description = 'Cenote information repository';
    public deletedRecord: string = DELETED_RECORDS_SUPPORT.NO;
    public granularity: string = HARVESTING_GRANULARITY.DATETIME;
    public earliestDatestamp = '2021-01-01T00:00:00Z';
}
